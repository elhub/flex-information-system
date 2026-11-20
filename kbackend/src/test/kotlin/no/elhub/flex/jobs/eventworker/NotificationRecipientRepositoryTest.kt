package no.elhub.flex.jobs.eventworker

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.assertions.withClue
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import no.elhub.flex.PostgresTestContainer
import no.elhub.flex.shared.auth.FlexPrincipal
import java.time.OffsetDateTime

class NotificationRecipientRepositoryTest : FunSpec({

    val repository = NotificationRecipientRepositoryImpl()

    fun event(type: String, subjectId: Long?) = Event(
        id = 1,
        type = type,
        sourceId = 1,
        subjectId = subjectId,
        recordedAt = OffsetDateTime.now(),
        recordedBy = 0,
    )

    test("every query that gives recipients can be run by the worker role with the parameters of an event") {
        PostgresTestContainer.database // makes sure the database is ready

        val types = RecipientQueries.eventTypes
        types shouldHaveSize 50

        types.forEach { type ->
            listOf(null, 2L).forEach { subjectId ->
                withClue("$type with subject $subjectId") {
                    with(FlexPrincipal.internalEventNotification) {
                        repository.getRecipients(event(type, subjectId))
                    }.shouldBeRight()
                }
            }
        }
    }

    test("event types without notifications have no recipients") {
        with(FlexPrincipal.internalEventNotification) {
            repository.getRecipients(event("no.elhub.flex.unknown_resource.create", null))
        }.shouldBeRight() shouldBe emptyList()
    }
})
