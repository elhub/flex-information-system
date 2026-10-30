package no.elhub.flex.jobs.sendnoticemail

import com.zaxxer.hikari.HikariDataSource
import no.elhub.flex.jobs.dataSourceFromEnv
import no.elhub.flex.jobs.sendnoticemail.email.LoggingMailClient
import no.elhub.flex.jobs.sendnoticemail.email.MailClient
import no.elhub.flex.jobs.sendnoticemail.email.SmtpMailClient
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

/**
 * The mail job connects to the database with its own user (`NOTICE_MAIL_DB_USERNAME` /
 * `NOTICE_MAIL_DB_PASSWORD`) and does not need the adapter, so it does not include
 * [no.elhub.flex.jobs.JobInfrastructureModule].
 */
@Module
@ComponentScan("no.elhub.flex.jobs.sendnoticemail")
class SendNoticeMailModule {

    @Single(createdAtStart = true)
    fun dataSource(): HikariDataSource =
        dataSourceFromEnv(usernameVar = "NOTICE_MAIL_DB_USERNAME", passwordVar = "NOTICE_MAIL_DB_PASSWORD")

    @Single(createdAtStart = true)
    fun mailConfig(): MailConfig = MailConfig.fromEnv()

    @Single(createdAtStart = true)
    fun mailClient(config: MailConfig): MailClient =
        if (config.dryRun) LoggingMailClient() else SmtpMailClient(config)
}

@KoinApplication(modules = [SendNoticeMailModule::class])
class SendNoticeMailApp
