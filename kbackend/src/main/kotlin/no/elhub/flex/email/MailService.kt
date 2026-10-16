package no.elhub.flex.email

import org.koin.core.annotation.Single

@Single
class MailService(
    @Suppress("unused") private val mailClient: MailClient,
) {
    suspend fun run() {
        // TODO: notification logic
    }
}
