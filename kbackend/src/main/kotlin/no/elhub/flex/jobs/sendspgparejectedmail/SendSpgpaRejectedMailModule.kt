package no.elhub.flex.jobs.sendspgparejectedmail

import com.zaxxer.hikari.HikariDataSource
import no.elhub.flex.jobs.dataSourceFromEnv
import no.elhub.flex.jobs.sendnoticemail.MailConfig
import no.elhub.flex.jobs.sendnoticemail.email.LoggingMailClient
import no.elhub.flex.jobs.sendnoticemail.email.MailClient
import no.elhub.flex.jobs.sendnoticemail.email.SmtpMailClient
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

/** Uses the same database user and mail configuration as the notice mail job. */
@Module
@ComponentScan("no.elhub.flex.jobs.sendspgparejectedmail")
class SendSpgpaRejectedMailModule {

    @Single(createdAtStart = true)
    fun dataSource(): HikariDataSource =
        dataSourceFromEnv(usernameVar = "NOTICE_MAIL_DB_USERNAME", passwordVar = "NOTICE_MAIL_DB_PASSWORD")

    @Single(createdAtStart = true)
    fun mailConfig(): MailConfig = MailConfig.fromEnv()

    @Single(createdAtStart = true)
    fun mailClient(config: MailConfig): MailClient =
        if (config.dryRun) LoggingMailClient() else SmtpMailClient(config)
}

@KoinApplication(modules = [SendSpgpaRejectedMailModule::class])
class SendSpgpaRejectedMailApp
