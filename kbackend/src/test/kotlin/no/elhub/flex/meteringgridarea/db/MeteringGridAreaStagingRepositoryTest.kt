package no.elhub.flex.meteringgridarea.db

import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction
import no.elhub.flex.integration.adapter.generated.models.MeteringGridAreaPriceArea
import no.elhub.flex.integration.adapter.generated.models.MeteringGridAreaSystemOperator
import no.elhub.flex.integration.adapter.generated.models.PriceArea
import no.elhub.flex.model.domain.db.DatabaseError
import java.sql.ResultSet
import kotlin.time.Instant
import no.elhub.flex.integration.adapter.generated.models.MeteringGridArea as AdapterMeteringGridArea

/**
 * Runs against the real database, connected as `flex_staging_structure_data` like the jobs are in
 * production. [FlexTransaction] is global, so it is pointed at that connection for this spec only.
 */
class MeteringGridAreaStagingRepositoryTest : FunSpec({

    val repo = MeteringGridAreaRepositoryImpl()
    val principal = FlexPrincipal(role = "flex_staging_structure_data", eid = "0")

    val from = Instant.parse("2024-01-01T00:00:00Z")
    val to = Instant.parse("2025-01-01T00:00:00Z")
    val area = AdapterMeteringGridArea(
        businessId = "10YNO-1--------2",
        name = "Oslo",
        isActive = true,
        systemOperator = listOf(
            MeteringGridAreaSystemOperator(businessId = "1337000000044", validFrom = from, validTo = to),
            MeteringGridAreaSystemOperator(businessId = "1337000100041", validFrom = to, validTo = null),
        ),
        priceArea = listOf(MeteringGridAreaPriceArea(priceArea = PriceArea.NO1, validFrom = from)),
    )
    val inactiveArea = AdapterMeteringGridArea(
        businessId = "10YNO-2--------T",
        name = "Kristiansand",
        isActive = false,
        systemOperator = emptyList(),
        priceArea = emptyList(),
    )

    beforeSpec { FlexTransaction.init(PostgresTestContainer.stagingDatabase) }
    afterSpec { FlexTransaction.init(PostgresTestContainer.database) }

    beforeTest {
        with(principal) { repo.prepareStaging() }.shouldBeRight()
    }

    test("batchInsertStagingMeteringGridAreas writes name and status") {
        with(principal) { repo.batchInsertStagingMeteringGridAreas(listOf(area, inactiveArea)) }.shouldBeRight()

        query("SELECT business_id, name, status FROM staging.metering_grid_area ORDER BY business_id") {
            Triple(it.getString(1), it.getString(2), it.getString(3))
        } shouldBe listOf(
            Triple("10YNO-1--------2", "Oslo", "active"),
            Triple("10YNO-2--------T", "Kristiansand", "inactive"),
        )
    }

    test("batchInsertStagingMeteringGridAreaSystemOperators writes closed and open-ended ranges") {
        with(principal) {
            repo.batchInsertStagingMeteringGridAreaSystemOperators(listOf(area, inactiveArea))
        }.shouldBeRight()

        query(
            """
            SELECT metering_grid_area_business_id, system_operator_business_id,
                   extract(epoch FROM lower(valid_time_range))::bigint,
                   extract(epoch FROM upper(valid_time_range))::bigint
            FROM staging.metering_grid_area_system_operator
            ORDER BY lower(valid_time_range)
            """.trimIndent(),
        ) { listOf(it.getString(1), it.getString(2), it.getObject(3), it.getObject(4)) } shouldBe listOf(
            listOf("10YNO-1--------2", "1337000000044", from.epochSeconds, to.epochSeconds),
            listOf("10YNO-1--------2", "1337000100041", to.epochSeconds, null),
        )
    }

    test("batchInsertStagingMeteringGridAreaPriceAreas writes price area and open-ended range") {
        with(principal) { repo.batchInsertStagingMeteringGridAreaPriceAreas(listOf(area, inactiveArea)) }.shouldBeRight()

        query(
            """
            SELECT metering_grid_area_business_id, price_area, upper_inf(valid_time_range)
            FROM staging.metering_grid_area_price_area
            """.trimIndent(),
        ) { Triple(it.getString(1), it.getString(2), it.getBoolean(3)) } shouldBe
            listOf(Triple("10YNO-1--------2", "NO1", true))
    }

    test("prepareStaging empties all three staging tables") {
        with(principal) {
            repo.batchInsertStagingMeteringGridAreas(listOf(area)).shouldBeRight()
            repo.batchInsertStagingMeteringGridAreaSystemOperators(listOf(area)).shouldBeRight()
            repo.batchInsertStagingMeteringGridAreaPriceAreas(listOf(area)).shouldBeRight()
            repo.prepareStaging().shouldBeRight()
        }

        listOf("metering_grid_area", "metering_grid_area_system_operator", "metering_grid_area_price_area")
            .forEach { table -> query("SELECT count(*) FROM staging.$table") { it.getInt(1) } shouldBe listOf(0) }
    }

    test("a failing insert returns Left DatabaseError") {
        val invalid = area.copy(businessId = "not-an-eic-y-code")

        val result = with(principal) { repo.batchInsertStagingMeteringGridAreas(listOf(invalid)) }

        result.shouldBeLeft().shouldBeInstanceOf<DatabaseError>()
    }

    test("finaliseStaging merges staged MGAs into flex") {
        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { it.execute("TRUNCATE flex.metering_grid_area CASCADE") }
        }
        with(principal) {
            repo.batchInsertStagingMeteringGridAreas(listOf(area, inactiveArea)).shouldBeRight()
            repo.finaliseStaging().shouldBeRight()
        }

        query("SELECT business_id, status FROM flex.metering_grid_area ORDER BY business_id") {
            it.getString(1) to it.getString(2)
        } shouldBe listOf("10YNO-1--------2" to "active", "10YNO-2--------T" to "inactive")
    }
})

private fun <T> query(sql: String, mapper: (ResultSet) -> T): List<T> =
    PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { stmt ->
            stmt.executeQuery(sql).use { rs -> buildList { while (rs.next()) add(mapper(rs)) } }
        }
    }
