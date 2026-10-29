package no.elhub.flex.jobs.syncmeteringgridarea

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.jobs.JobError
import no.elhub.flex.shared.adapter.AdapterClientConfig
import no.elhub.flex.shared.adapter.AdapterHttpClient
import no.elhub.flex.shared.adapter.AdapterWireMockServer
import no.elhub.flex.shared.db.FlexTransaction
import java.sql.Connection
import java.sql.ResultSet
import kotlin.time.Instant

private const val API_KEY = "secret-key"

private const val SO_COMMON = "1337000000044"
private const val SO_TEST = "1337000100041"
private const val SO_EMIL = "1337000200048"

private val T_START = Instant.parse("2023-10-01T00:00:00+02:00").epochSeconds
private val T_2026 = Instant.parse("2026-01-01T00:00:00+01:00").epochSeconds
private val T_END_2026 = Instant.parse("2026-12-31T00:00:00+01:00").epochSeconds

private data class Mga(val businessId: String, val name: String, val status: String)

private data class Relation(val id: Long, val mga: String, val value: String, val from: Long, val to: Long?)

/**
 * Runs the whole sync job against the real database: the adapter is a WireMock stub and the
 * database is the Testcontainers Postgres, connected as `flex_staging_structure_data` like in
 * production.
 *
 * The database is seeded with the same MGAs as the test data package (`db/test_data/test_data.sql`),
 * and the stubbed adapter returns them with a few changes (see `metering-grid-areas-sync-scenario-200.json`,
 * also served by the local adapter mock in `local/adapter/main.py`).
 */
class SyncMeteringGridAreaDataJobTest : FunSpec({
    extensions(AdapterWireMockServer)

    val seedMgas = listOf(
        Triple("31Y-COMMON-SHA-Q", "Common Shared AREA 1", Pair(SO_COMMON, "NO4")),
        Triple("42Y-COMMON-SHA-W", "Common Shared AREA 2", Pair(SO_COMMON, "NO3")),
        Triple("31Y-TEST-SUITE-0", "Test Suite AREA 1", Pair(SO_TEST, "NO4")),
        Triple("42Y-TEST-SUITE-6", "Test Suite AREA 2", Pair(SO_TEST, "NO3")),
        Triple("31Y-EMIL-POST--K", "Emil Post AREA 1", Pair(SO_EMIL, "NO4")),
        Triple("42Y-EMIL-POST--Q", "Emil Post AREA 2", Pair(SO_EMIL, "NO3")),
    )

    fun job(finalise: Boolean = true) = SyncMeteringGridAreaDataJob(
        adapterClient = AdapterHttpClient(AdapterClientConfig(AdapterWireMockServer.baseUrl(), API_KEY)),
        meteringGridAreaRepository = MeteringGridAreaStagingRepositoryImpl(),
        finalise = finalise,
    )

    fun stubAdapter(body: String) = AdapterWireMockServer.stubFor(
        get(urlPathEqualTo("/metering_grid_area"))
            .willReturn(aResponse().withStatus(200).withHeader("Content-Type", "application/json").withBody(body)),
    )

    fun stubScenario() = AdapterWireMockServer.stubFor(
        get(urlPathEqualTo("/metering_grid_area"))
            .willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                    .withBodyFile("metering-grid-areas-sync-scenario-200.json"),
            ),
    )

    beforeSpec { FlexTransaction.init(PostgresTestContainer.stagingDatabase) }
    afterSpec { FlexTransaction.init(PostgresTestContainer.database) }

    beforeTest {
        AdapterWireMockServer.resetAll()
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { it.execute("TRUNCATE flex.metering_grid_area CASCADE") }
            val parties = listOf(SO_COMMON, SO_TEST, SO_EMIL).associateWith { getOrCreateSystemOperator(conn, it) }
            seed(conn, seedMgas, parties)
        }
    }

    test("sync creates, updates, deactivates and deletes records as expected") {
        stubScenario()
        val soBefore = systemOperators()
        val paBefore = priceAreas()

        job().run().shouldBeRight()

        // MGAs
        mgas() shouldBe listOf(
            Mga("27YCEST-LA-RE7-U", "K-RIS AREA 51", "active"), // new
            Mga("31Y-COMMON-SHA-Q", "Common Shared AREA 1", "active"), // unchanged
            Mga("31Y-EMIL-POST--K", "Emil Post AREA 1", "active"), // unchanged
            Mga("31Y-TEST-SUITE-0", "Test Suite AREA 1", "inactive"), // deactivated by the adapter
            Mga("42Y-COMMON-SHA-W", "Common Shared AREA 2 RENAMED", "active"), // renamed
            Mga("42Y-EMIL-POST--Q", "Emil Post AREA 2", "inactive"), // missing from the adapter
            Mga("42Y-TEST-SUITE-6", "Test Suite AREA 2", "active"), // unchanged
        )

        // system operators
        val so = systemOperators()
        so.map { it.copy(id = 0) } shouldBe listOf(
            Relation(0, "27YCEST-LA-RE7-U", SO_TEST, T_START, null), // new MGA
            Relation(0, "31Y-COMMON-SHA-Q", SO_COMMON, T_START, null), // unchanged
            Relation(0, "31Y-EMIL-POST--K", SO_EMIL, T_START, T_2026), // terminated
            Relation(0, "31Y-EMIL-POST--K", SO_TEST, T_2026, null), // new record after it
            Relation(0, "31Y-TEST-SUITE-0", SO_TEST, T_START, null),
            Relation(0, "42Y-COMMON-SHA-W", SO_COMMON, T_START, T_END_2026), // terminated, no successor
            Relation(0, "42Y-TEST-SUITE-6", SO_TEST, T_START, null),
            // 42Y-EMIL-POST--Q: records deleted because the MGA is missing
        )
        // terminated records are updated in place (same id), not deleted and recreated
        so.first { it.mga == "31Y-EMIL-POST--K" && it.from == T_START }.id shouldBe
            soBefore.first { it.mga == "31Y-EMIL-POST--K" }.id
        so.first { it.mga == "42Y-COMMON-SHA-W" }.id shouldBe soBefore.first { it.mga == "42Y-COMMON-SHA-W" }.id
        so.none { it.mga == "42Y-EMIL-POST--Q" } shouldBe true

        // price areas
        val pa = priceAreas()
        pa.map { it.copy(id = 0) } shouldBe listOf(
            Relation(0, "27YCEST-LA-RE7-U", "NO2", T_START, null), // new MGA
            Relation(0, "31Y-COMMON-SHA-Q", "NO4", T_START, null),
            Relation(0, "31Y-EMIL-POST--K", "NO4", T_START, null),
            Relation(0, "31Y-TEST-SUITE-0", "NO4", T_START, null),
            Relation(0, "42Y-COMMON-SHA-W", "NO3", T_START, null),
            Relation(0, "42Y-TEST-SUITE-6", "NO3", T_START, T_2026), // terminated
            Relation(0, "42Y-TEST-SUITE-6", "NO1", T_2026, null), // new record after it
        )
        pa.first { it.mga == "42Y-TEST-SUITE-6" && it.from == T_START }.id shouldBe
            paBefore.first { it.mga == "42Y-TEST-SUITE-6" }.id
        pa.none { it.mga == "42Y-EMIL-POST--Q" } shouldBe true
    }

    test("running the sync twice gives the same result as running it once") {
        stubScenario()
        job().run().shouldBeRight()
        val mgas = mgas()
        val so = systemOperators()
        val pa = priceAreas()

        job().run().shouldBeRight()

        mgas() shouldBe mgas
        systemOperators() shouldBe so
        priceAreas() shouldBe pa
    }

    test("without finalise, data is only loaded into staging") {
        stubScenario()

        job(finalise = false).run().shouldBeRight()

        query("SELECT count(*) FROM staging.metering_grid_area") { it.getInt(1) } shouldBe listOf(6)
        mgas().map { it.name }.contains("Common Shared AREA 2 RENAMED") shouldBe false
        mgas().size shouldBe 6
    }

    test("an adapter response that would remove too much data is rejected and flex is left untouched") {
        stubAdapter("[]")
        val mgas = mgas()
        val so = systemOperators()
        val pa = priceAreas()

        job().run().shouldBeLeft().shouldBeInstanceOf<JobError.DatabaseError>()

        mgas() shouldBe mgas
        systemOperators() shouldBe so
        priceAreas() shouldBe pa
    }

    test("a failed load is rolled back as a whole, including the staging truncate") {
        stubScenario()
        job(finalise = false).run().shouldBeRight()
        query("SELECT count(*) FROM staging.metering_grid_area") { it.getInt(1) } shouldBe listOf(6)

        stubAdapter("[]")
        job().run().shouldBeLeft().shouldBeInstanceOf<JobError.DatabaseError>()

        query("SELECT count(*) FROM staging.metering_grid_area") { it.getInt(1) } shouldBe listOf(6)
    }

    test("an adapter failure is returned as an error and flex is left untouched") {
        AdapterWireMockServer.stubFor(
            get(urlPathEqualTo("/metering_grid_area")).willReturn(aResponse().withStatus(500)),
        )

        job().run().shouldBeLeft().shouldBeInstanceOf<JobError.HttpClientError>()

        mgas().size shouldBe 6
    }
})

private fun getOrCreateSystemOperator(conn: Connection, gln: String): Long {
    conn.autoCommit = false
    conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
    val existing = conn.prepareStatement("SELECT id FROM flex.party WHERE business_id = ? AND type = 'system_operator'")
        .use { stmt ->
            stmt.setString(1, gln)
            stmt.executeQuery().use { rs -> if (rs.next()) rs.getLong(1) else null }
        }
    if (existing != null) {
        conn.commit()
        return existing
    }

    val orgNumber = "1" + (0..99_999_999L).random().toString().padStart(8, '0')
    val entityId = conn.prepareStatement(
        "INSERT INTO flex.entity (name, type, business_id, business_id_type) VALUES (?, 'organisation', ?, 'org') RETURNING id",
    ).use { stmt ->
        stmt.setString(1, "System Operator $gln")
        stmt.setString(2, orgNumber)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }
    val partyId = conn.prepareStatement(
        "INSERT INTO flex.party (entity_id, name, type, role, business_id, business_id_type) VALUES (?, ?, 'system_operator', 'flex_system_operator', ?, 'gln') RETURNING id",
    ).use { stmt ->
        stmt.setLong(1, entityId)
        stmt.setString(2, "System Operator Party $gln")
        stmt.setString(3, gln)
        stmt.executeQuery().use { rs ->
            rs.next()
            rs.getLong(1)
        }
    }
    conn.commit()
    return partyId
}

private fun seed(
    conn: Connection,
    mgas: List<Triple<String, String, Pair<String, String>>>,
    parties: Map<String, Long>,
) {
    conn.autoCommit = false
    conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
    mgas.forEach { (businessId, name, relations) ->
        val (soGln, priceArea) = relations
        val mgaId = conn.prepareStatement(
            "INSERT INTO flex.metering_grid_area (business_id, name, recorded_by) VALUES (?, ?, 0) RETURNING id",
        ).use { stmt ->
            stmt.setString(1, businessId)
            stmt.setString(2, name)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }
        conn.prepareStatement(
            """
            INSERT INTO flex.metering_grid_area_price_area (metering_grid_area_id, price_area, valid_time_range, recorded_by)
            VALUES (?, ?, tstzrange('2023-10-01 Europe/Oslo', null, '[)'), 0)
            """.trimIndent(),
        ).use { stmt ->
            stmt.setLong(1, mgaId)
            stmt.setString(2, priceArea)
            stmt.executeUpdate()
        }
        conn.prepareStatement(
            """
            INSERT INTO flex.metering_grid_area_system_operator (metering_grid_area_id, system_operator_id, valid_time_range, recorded_by)
            VALUES (?, ?, tstzrange('2023-10-01 Europe/Oslo', null, '[)'), 0)
            """.trimIndent(),
        ).use { stmt ->
            stmt.setLong(1, mgaId)
            stmt.setLong(2, parties.getValue(soGln))
            stmt.executeUpdate()
        }
    }
    conn.commit()
}

private fun mgas(): List<Mga> =
    query("SELECT business_id, name, status FROM flex.metering_grid_area ORDER BY business_id") {
        Mga(it.getString(1), it.getString(2), it.getString(3))
    }

private fun systemOperators(): List<Relation> = query(
    """
    SELECT r.id, mga.business_id, so.business_id,
           extract(epoch FROM lower(r.valid_time_range))::bigint,
           extract(epoch FROM upper(r.valid_time_range))::bigint
    FROM flex.metering_grid_area_system_operator AS r
        INNER JOIN flex.metering_grid_area AS mga ON mga.id = r.metering_grid_area_id
        INNER JOIN flex.party AS so ON so.id = r.system_operator_id
    ORDER BY mga.business_id, lower(r.valid_time_range)
    """.trimIndent(),
) { it.toRelation() }

private fun priceAreas(): List<Relation> = query(
    """
    SELECT r.id, mga.business_id, r.price_area,
           extract(epoch FROM lower(r.valid_time_range))::bigint,
           extract(epoch FROM upper(r.valid_time_range))::bigint
    FROM flex.metering_grid_area_price_area AS r
        INNER JOIN flex.metering_grid_area AS mga ON mga.id = r.metering_grid_area_id
    ORDER BY mga.business_id, lower(r.valid_time_range)
    """.trimIndent(),
) { it.toRelation() }

private fun ResultSet.toRelation() = Relation(
    id = getLong(1),
    mga = getString(2),
    value = getString(3),
    from = getLong(4),
    to = getObject(5)?.let { getLong(5) },
)

private fun <T> query(sql: String, mapper: (ResultSet) -> T): List<T> =
    PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { stmt ->
            stmt.executeQuery(sql).use { rs -> buildList { while (rs.next()) add(mapper(rs)) } }
        }
    }
