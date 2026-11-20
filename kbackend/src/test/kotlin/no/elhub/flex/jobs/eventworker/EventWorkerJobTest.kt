package no.elhub.flex.jobs.eventworker

import io.kotest.assertions.nondeterministic.eventually
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.launch
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.testutil.truncate
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds

/** Runs [EventWorkerJob] as a loop against the real database. */
class EventWorkerJobTest : FunSpec({

    val job = EventWorkerJob(
        EventNotificationRepositoryImpl(),
        NotificationRecipientRepositoryImpl(),
        EventWorkerConfig(pollInterval = 50.milliseconds, batchSize = 2),
    )

    fun insertUnknownEvent() = PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use {
            it.execute(
                "INSERT INTO flex.event (type, source_resource, source_id, recorded_by) " +
                    "VALUES ('no.elhub.flex.unknown_resource.create', 'unknown_resource', 1, 0)",
            )
        }
    }

    fun unprocessedCount(): Int = PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { stmt ->
            stmt.executeQuery("SELECT count(*) FROM flex.event WHERE NOT processed").use { rs ->
                rs.next()
                rs.getInt(1)
            }
        }
    }

    beforeEach { truncate("flex.event", "flex.notification") }

    test("keeps processing events, including ones that arrive later, until it is cancelled") {
        repeat(5) { insertUnknownEvent() }

        val running = launch { job.run() }

        eventually(10.seconds) { unprocessedCount() shouldBe 0 }

        insertUnknownEvent()
        eventually(10.seconds) { unprocessedCount() shouldBe 0 }

        running.isActive shouldBe true
        running.cancelAndJoin()
        running.isCancelled shouldBe true
    }
})
