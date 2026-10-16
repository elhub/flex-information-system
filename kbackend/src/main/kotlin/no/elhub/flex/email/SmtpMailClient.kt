package no.elhub.flex.email

import jakarta.mail.Authenticator
import jakarta.mail.Message
import jakarta.mail.PasswordAuthentication
import jakarta.mail.Session
import jakarta.mail.Transport
import jakarta.mail.internet.InternetAddress
import jakarta.mail.internet.MimeMessage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.koin.core.annotation.Single
import java.util.Properties

@Single(binds = [MailClient::class])
class SmtpMailClient(private val config: MailConfig) : MailClient {

    private val session: Session by lazy {
        val props = Properties().apply {
            put("mail.smtp.host", config.host)
            put("mail.smtp.port", config.port.toString())
            put("mail.smtp.starttls.enable", config.startTls.toString())
            put("mail.smtp.auth", config.username.isNotBlank().toString())
        }
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
                setText(mail.content, "UTF-8")
            }
            Transport.send(message)
        }
    }
}
