package no.elhub.flex.email

interface MailClient {
    suspend fun send(mail: Mail)
}
