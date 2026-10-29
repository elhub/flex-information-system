package no.elhub.flex.jobs

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.db.FlexTransaction
import no.elhub.flex.integration.adapter.AdapterHttpClient
import no.elhub.flex.integration.adapter.AdapterWireMockServer
import no.elhub.flex.party.db.PartyStagingRepositoryImpl
import java.sql.ResultSet

private const val API_KEY = "secret-key"

private const val PARTIES = """
[
  {"gln": "7080000100019", "org": "123456789", "name": "Acme Energy AS", "type": "energy_supplier"},
  {"gln": "7080000100026", "org": "987654321", "name": "Dual Role AS", "type": "system_operator"},
  {"gln": "7080000100026", "org": "987654321", "name": "Dual Role AS", "type": "service_provider"}
]
"""

/**
 * Runs the whole party sync job against the real database: the adapter is a WireMock stub and the
 * database is the Testcontainers Postgres, connected as `flex_staging_structure_data`.
 */
class SyncPartyDataJobTest : FunSpec({
    extensions(AdapterWireMockServer)

    fun job(finalise: Boolean = true) = SyncPartyDataJob(
        adapterClient = AdapterHttpClient(AdapterWireMockServer.baseUrl(), API_KEY),
        partyStagingRepository = PartyStagingRepositoryImpl(),
        finalise = finalise,
    )

    fun stubAdapter(body: String) = AdapterWireMockServer.stubFor(
        get(urlPathEqualTo("/parties"))
            .willReturn(aResponse().withStatus(200).withHeader("Content-Type", "application/json").withBody(body)),
    )

    beforeSpec { FlexTransaction.init(PostgresTestContainer.stagingDatabase) }
    afterSpec { FlexTransaction.init(PostgresTestContainer.database) }

    beforeTest {
        AdapterWireMockServer.resetAll()
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use {
                it.execute("TRUNCATE staging.party")
                it.execute("DELETE FROM flex.party_staging WHERE gln IN ('7080000100019', '7080000100026')")
            }
        }
    }

    test("sync loads parties into staging and merges them into flex") {
        stubAdapter(PARTIES)

        job().run().shouldBeRight()

        query("SELECT gln, org, name, type FROM staging.party ORDER BY gln, type") {
            listOf(it.getString(1), it.getString(2), it.getString(3), it.getString(4))
        } shouldBe listOf(
            listOf("7080000100019", "123456789", "Acme Energy AS", "energy_supplier"),
            listOf("7080000100026", "987654321", "Dual Role AS", "service_provider"),
            listOf("7080000100026", "987654321", "Dual Role AS", "system_operator"),
        )
        query("SELECT gln, org, name, type FROM flex.party_staging WHERE gln = '7080000100019'") {
            listOf(it.getString(1), it.getString(2), it.getString(3), it.getString(4))
        } shouldBe listOf(listOf("7080000100019", "123456789", "Acme Energy AS", "energy_supplier"))
    }

    test("without finalise, data is only loaded into staging") {
        stubAdapter(PARTIES)

        job(finalise = false).run().shouldBeRight()

        query("SELECT count(*) FROM staging.party") { it.getInt(1) } shouldBe listOf(3)
        query("SELECT count(*) FROM flex.party_staging WHERE gln = '7080000100019'") { it.getInt(1) } shouldBe listOf(0)
    }

    test("a rejected finalise rolls back the staging truncate and preserves flex") {
        fun partyRows(table: String) = query("SELECT gln, org, name, type FROM $table ORDER BY gln, type") {
            listOf(it.getString(1), it.getString(2), it.getString(3), it.getString(4))
        }

        stubAdapter(PARTIES)
        job().run().shouldBeRight()
        val stagingBefore = partyRows("staging.party")
        val flexBefore = partyRows("flex.party_staging")

        AdapterWireMockServer.resetAll()
        stubAdapter("[]")
        job().run().shouldBeLeft().shouldBeInstanceOf<JobError.DatabaseError>()

        partyRows("staging.party") shouldBe stagingBefore
        partyRows("flex.party_staging") shouldBe flexBefore
    }

    test("an adapter failure is returned as an error") {
        AdapterWireMockServer.stubFor(get(urlPathEqualTo("/parties")).willReturn(aResponse().withStatus(500)))

        job().run().shouldBeLeft().shouldBeInstanceOf<JobError.HttpClientError>()
    }
})

private fun <T> query(sql: String, mapper: (ResultSet) -> T): List<T> =
    PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { st ->
            st.executeQuery(sql).use { rs -> generateSequence { if (rs.next()) mapper(rs) else null }.toList() }
        }
    }
