package no.elhub.flex.email

import org.koin.core.annotation.Property
import org.koin.core.annotation.Single

@Single
class MailConfig(
    @Property("mail.host") val host: String,
    @Property("mail.port") val port: Int,
    @Property("mail.username") val username: String,
    @Property("mail.password") val password: String,
    @Property("mail.from") val from: String,
    @Property("mail.start-tls") val startTls: Boolean,
)
