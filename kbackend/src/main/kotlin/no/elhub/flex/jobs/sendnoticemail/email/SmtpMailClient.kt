package no.elhub.flex.jobs.sendnoticemail.email

import jakarta.mail.Authenticator
import jakarta.mail.Message
import jakarta.mail.PasswordAuthentication
import jakarta.mail.Session
import jakarta.mail.Transport
import jakarta.mail.internet.InternetAddress
import jakarta.mail.internet.MimeMessage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import no.elhub.flex.jobs.sendnoticemail.MailConfig
import java.util.Properties

class SmtpMailClient(private val config: MailConfig) : MailClient {

    private val session: Session by lazy {
        val props = smtpProperties(config)
        if (config.username.isNotBlank()) {
            Session.getInstance(
                props,
                object : Authenticator() {
                    override fun getPasswordAuthentication() = PasswordAuthentication(config.username, config.password)
                }
            )
        } else {
            Session.getInstance(props)
        }
    }

    override suspend fun send(mail: Mail) {
        withContext(Dispatchers.IO) {
            val message = MimeMessage(session).apply {
                setFrom(InternetAddress(config.from))
                setRecipients(Message.RecipientType.TO, InternetAddress.parse(mail.mailTo))
                subject = mail.subject
                setContent(mail.content, "text/html; charset=UTF-8")
            }
            Transport.send(message)
        }
    }
}

private const val CONNECTION_TIMEOUT_MS = 10_000
private const val IO_TIMEOUT_MS = 30_000

internal fun smtpProperties(config: MailConfig): Properties = Properties().apply {
    put("mail.smtp.host", config.host)
    put("mail.smtp.port", config.port.toString())
    put("mail.smtp.auth", config.username.isNotBlank().toString())
    put("mail.smtp.starttls.enable", config.startTls.toString())
    // never fall back to plaintext when STARTTLS is requested
    put("mail.smtp.ssl.checkserveridentity", "true")
    put("mail.smtp.starttls.required", config.startTls.toString())
    put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3")
    put("mail.smtp.connectiontimeout", CONNECTION_TIMEOUT_MS.toString())
    put("mail.smtp.timeout", IO_TIMEOUT_MS.toString())
    put("mail.smtp.writetimeout", IO_TIMEOUT_MS.toString())
}
