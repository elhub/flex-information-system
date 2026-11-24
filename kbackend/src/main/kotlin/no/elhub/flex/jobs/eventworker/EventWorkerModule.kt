package no.elhub.flex.jobs.eventworker

import com.zaxxer.hikari.HikariDataSource
import no.elhub.flex.jobs.dataSourceFromEnv
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

/**
 * The event worker only talks to the database, so it does not include
 * [no.elhub.flex.jobs.JobInfrastructureModule].
 * It connects with the provided database credentials and switches to the
 * `flex_internal_event_notification` role in every transaction.
 */
@Module
@ComponentScan("no.elhub.flex.jobs.eventworker")
class EventWorkerModule {

    @Single(createdAtStart = true)
    fun dataSource(): HikariDataSource = dataSourceFromEnv()

    @Single(createdAtStart = true)
    fun config(): EventWorkerConfig = EventWorkerConfig.fromEnv()
}

@KoinApplication(modules = [EventWorkerModule::class])
class EventWorkerApp
