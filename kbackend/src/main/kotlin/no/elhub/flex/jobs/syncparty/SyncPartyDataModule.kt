package no.elhub.flex.jobs.syncparty

import no.elhub.flex.jobs.JobInfrastructureModule
import no.elhub.flex.jobs.booleanEnv
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

data class SyncPartyDataConfig(
    val finalise: Boolean,
)

@Module(includes = [JobInfrastructureModule::class])
@ComponentScan("no.elhub.flex.jobs.syncparty")
class SyncPartyDataModule {

    @Single(createdAtStart = true)
    fun config(): SyncPartyDataConfig =
        SyncPartyDataConfig(finalise = booleanEnv("SYNC_PARTY_DATA_FINALISE"))
}

@KoinApplication(modules = [SyncPartyDataModule::class])
class SyncPartyDataApp
