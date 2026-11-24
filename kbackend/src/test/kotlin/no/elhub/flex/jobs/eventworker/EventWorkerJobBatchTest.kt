package no.elhub.flex.jobs.eventworker

import arrow.core.Either
import arrow.core.left
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldNotContain
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.runBlocking
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.testutil.seed
import no.elhub.flex.testutil.truncate

private const val SOPT_CREATE = "no.elhub.flex.system_operator_product_type.create"
private const val UNKNOWN_TYPE = "no.elhub.flex.unknown_resource.create"

private data class Fixture(val systemOperatorId: Long, val serviceProviderId: Long, val serviceProviderEntityId: Long)

/**
 * Runs [EventWorkerJob.processBatch] with the real repositories.
 * The events are the ones created by the database triggers when the test data is inserted.
 */
class EventWorkerJobBatchTest : FunSpec({

    val eventRepository = EventNotificationRepositoryImpl()
    val defaultProcessor = EventWorkerJob(eventRepository, NotificationRecipientRepositoryImpl(), EventWorkerConfig())

    fun process(processor: EventWorkerJob = defaultProcessor, batchSize: Int = 42): Either<RepositoryError, Boolean> =
        runBlocking {
            with(FlexPrincipal.internalEventNotification) { processor.processBatch(batchSize) }
        }

    fun activateParty(partyId: Long) = PostgresTestContainer.withConnection { conn ->
        conn.autoCommit = false
        conn.createStatement().use { it.execute("SELECT flex.set_entity_party_identity(0, 0, 0)") }
        conn.prepareStatement("UPDATE flex.party SET status = 'active' WHERE id = ?").use { stmt ->
            stmt.setLong(1, partyId)
            stmt.executeUpdate()
        }
        conn.commit()
    }

    /** A system operator product type is created, which notifies the system operator and all active service providers. */
    fun seedProductTypeCreation(): Fixture {
        // the service provider is created before the event, so that it is in the party history at that time
        val serviceProvider = seed { insertPartyWithIdentity("Test SP", "service_provider", "flex_service_provider") }
        activateParty(serviceProvider.partyId)
        val systemOperatorId = seed {
            val systemOperatorId = insertSystemOperator().partyId
            insertSystemOperatorProductType(systemOperatorId, insertProductType())
            systemOperatorId
        }
        return Fixture(systemOperatorId, serviceProvider.partyId, serviceProvider.entityId)
    }

    fun insertUnknownEvent(): Long = PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement(
            "INSERT INTO flex.event (type, source_resource, source_id, recorded_by) VALUES (?::ltree, 'unknown_resource', 1, 0) RETURNING id",
        ).use { stmt ->
            stmt.setString(1, UNKNOWN_TYPE)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getLong(1)
            }
        }
    }

    fun eventIds(type: String): List<Long> = PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement("SELECT id FROM flex.event WHERE type::text = ? ORDER BY id").use { stmt ->
            stmt.setString(1, type)
            stmt.executeQuery().use { rs -> generateSequence { if (rs.next()) rs.getLong(1) else null }.toList() }
        }
    }

    fun isProcessed(eventId: Long): Boolean = PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement("SELECT processed FROM flex.event WHERE id = ?").use { stmt ->
            stmt.setLong(1, eventId)
            stmt.executeQuery().use { rs ->
                rs.next()
                rs.getBoolean(1)
            }
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

    fun notifiedParties(eventId: Long): List<Long> = PostgresTestContainer.withConnection { conn ->
        conn.prepareStatement("SELECT party_id FROM flex.notification WHERE event_id = ? ORDER BY party_id").use { stmt ->
            stmt.setLong(1, eventId)
            stmt.executeQuery().use { rs -> generateSequence { if (rs.next()) rs.getLong(1) else null }.toList() }
        }
    }

    fun notificationCount(): Int = PostgresTestContainer.withConnection { conn ->
        conn.createStatement().use { stmt ->
            stmt.executeQuery("SELECT count(*) FROM flex.notification").use { rs ->
                rs.next()
                rs.getInt(1)
            }
        }
    }

    beforeEach {
        truncate("flex.event", "flex.notification", "flex.party", "flex.entity", "flex.product_type")
    }

    test("returns false when there is nothing to process") {
        process().shouldBeRight() shouldBe false
    }

    test("notifies the parties of the event and marks it as processed") {
        val fixture = seedProductTypeCreation()
        val eventId = eventIds(SOPT_CREATE).single()

        process().shouldBeRight() shouldBe true

        notifiedParties(eventId).apply {
            shouldContain(fixture.systemOperatorId)
            shouldContain(fixture.serviceProviderId)
        }
        isProcessed(eventId) shouldBe true
        process().shouldBeRight() shouldBe false
    }

    test("does not notify the party that caused the event") {
        val fixture = seedProductTypeCreation()
        val eventId = eventIds(SOPT_CREATE).single()
        PostgresTestContainer.withConnection { conn ->
            conn.prepareStatement(
                "UPDATE flex.event SET recorded_by = (SELECT id FROM flex.identity WHERE party_id = ?) WHERE id = ?",
            ).use { stmt ->
                stmt.setLong(1, fixture.serviceProviderId)
                stmt.setLong(2, eventId)
                stmt.executeUpdate()
            }
        }

        process().shouldBeRight()

        notifiedParties(eventId).apply {
            shouldContain(fixture.systemOperatorId)
            shouldNotContain(fixture.serviceProviderId)
        }
    }

    test("handling an event a second time does not create a second notification") {
        seedProductTypeCreation()
        val eventId = eventIds(SOPT_CREATE).single()
        process().shouldBeRight()
        val before = notifiedParties(eventId)

        PostgresTestContainer.withConnection { conn ->
            conn.createStatement().use { it.execute("UPDATE flex.event SET processed = false") }
        }
        process().shouldBeRight() shouldBe true

        notifiedParties(eventId) shouldBe before
    }

    test("marks events of types without notifications as processed") {
        val eventId = insertUnknownEvent()

        process().shouldBeRight() shouldBe true

        isProcessed(eventId) shouldBe true
        notifiedParties(eventId) shouldBe emptyList()
    }

    test("processes at most the batch size, oldest first") {
        val ids = List(3) { insertUnknownEvent() }

        process(batchSize = 2).shouldBeRight() shouldBe true
        ids.map { isProcessed(it) } shouldBe listOf(true, true, false)

        process(batchSize = 2).shouldBeRight() shouldBe true
        unprocessedCount() shouldBe 0
    }

    test("rolls back the whole batch when it cannot be acknowledged") {
        seedProductTypeCreation()
        val eventId = eventIds(SOPT_CREATE).single()
        val failingRepository = object : EventNotificationRepository by eventRepository {
            context(principal: FlexPrincipal)
            override suspend fun markProcessed(eventIds: List<Long>): Either<RepositoryError, Unit> =
                DatabaseError("boom").left()
        }

        process(EventWorkerJob(failingRepository, NotificationRecipientRepositoryImpl(), EventWorkerConfig())).shouldBeLeft()

        notificationCount() shouldBe 0
        isProcessed(eventId) shouldBe false
        // and the events can be processed afterwards
        process().shouldBeRight() shouldBe true
        notifiedParties(eventId).isNotEmpty() shouldBe true
    }
})
