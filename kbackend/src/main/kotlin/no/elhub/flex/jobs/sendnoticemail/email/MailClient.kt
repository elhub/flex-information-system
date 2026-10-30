package no.elhub.flex.jobs.sendnoticemail.email

interface MailClient {
    suspend fun send(mail: Mail)
}
