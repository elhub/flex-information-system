package no.elhub.flex

import io.ktor.server.application.install
import io.ktor.server.engine.EmbeddedServer
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.netty.NettyApplicationEngine
import io.ktor.server.plugins.autohead.AutoHeadResponse
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import no.elhub.flex.api.accountingpoint.AccountingPointService
import no.elhub.flex.api.accountingpoint.AccountingPointServiceImpl
import no.elhub.flex.api.accountingpoint.db.AccountingPointRepositoryImpl
import no.elhub.flex.api.attachment.AttachmentStorageService
import no.elhub.flex.api.attachment.S3AttachmentStorageService
import no.elhub.flex.api.config.AccountingPointAdapterConfig
import no.elhub.flex.api.config.AttachmentStorageConfig
import no.elhub.flex.api.config.FlexConfig
import no.elhub.flex.api.config.PostgrestConfig
import no.elhub.flex.api.config.RequireApiVersion
import no.elhub.flex.api.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.api.controllableunit.db.ControllableUnitRepositoryImpl
import no.elhub.flex.api.entity.db.EntityRepository
import no.elhub.flex.api.entity.db.EntityRepositoryImpl
import no.elhub.flex.api.event.db.EventRepository
import no.elhub.flex.api.event.db.EventRepositoryImpl
import no.elhub.flex.api.metrics.FlexMetrics
import no.elhub.flex.api.party.PartyService
import no.elhub.flex.api.party.PartyServiceImpl
import no.elhub.flex.api.party.db.PartyRepositoryImpl
import no.elhub.flex.api.postgrest.PostgrestClient
import no.elhub.flex.api.routes.attachment.attachmentRoutes
import no.elhub.flex.api.routes.controllableunit.ControllableUnitLookup
import no.elhub.flex.api.routes.controllableunit.controllableUnitRoutes
import no.elhub.flex.api.routes.data.ApiDocs
import no.elhub.flex.api.routes.data.DATA_API_MOUNT_PATH
import no.elhub.flex.api.routes.data.apiDocsRoutes
import no.elhub.flex.api.routes.data.dataApiRoutes
import no.elhub.flex.api.routes.entity.EntityLookup
import no.elhub.flex.api.routes.entity.entityRoutes
import no.elhub.flex.api.routes.notFoundRoute
import no.elhub.flex.auth.plugin.configureAuthentication
import no.elhub.flex.auth.util.TEST_JWT_SECRET
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.shared.accountingpoint.db.AccountingPointGridLocationRepositoryImpl
import no.elhub.flex.shared.accountingpoint.db.AccountingPointMeteringGridAreaRepositoryImpl
import no.elhub.flex.shared.accountingpoint.db.SubstationRepositoryImpl
import no.elhub.flex.shared.adapter.AdapterClientConfig
import no.elhub.flex.shared.adapter.AdapterHttpClient
import no.elhub.flex.shared.meteringgridarea.db.MeteringGridAreaRepositoryImpl
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import no.elhub.flex.shared.accountingpoint.AccountingPointService as SharedAccountingPointService
import no.elhub.flex.shared.accountingpoint.AccountingPointServiceImpl as SharedAccountingPointServiceImpl
import no.elhub.flex.shared.accountingpoint.db.AccountingPointRepositoryImpl as SharedAccountingPointRepositoryImpl
import no.elhub.flex.shared.controllableunit.db.ControllableUnitRepositoryImpl as SharedControllableUnitRepositoryImpl

const val API_VERSION = "2026-06-08"

private const val ATTACHMENT_ACCESS_KEY = "test-access-key"
private const val ATTACHMENT_SECRET_KEY = "test-secret-key"

/**
 * The data API of the backend, served in-process by a real HTTP server on a free port, on top of the real
 * [PostgrestTestContainer]. A real server is what handles a request that is answered before it is read to the end,
 * as an upload that is refused. The routes that kbackend implements itself run on the real database, the real
 * [AttachmentStorageTestContainer] and the [AdapterTestServer].
 *
 * The accounting point adapter is only called when [syncAccountingPoints] is set.
 */
fun apiTestServer(syncAccountingPoints: Boolean = false): EmbeddedServer<NettyApplicationEngine, NettyApplicationEngine.Configuration> {
    val postgrest = PostgrestClient(PostgrestConfig(PostgrestTestContainer.baseUrl))
    val flexConfig = FlexConfig(timezone = "Europe/Oslo", baseUrl = "https://flex.test/")
    val adapterConfig = AccountingPointAdapterConfig(
        baseUrl = AdapterTestServer.baseUrl,
        apiKey = "test-api-key",
        syncEnabled = syncAccountingPoints,
    )
    val attachmentStorageConfig = AttachmentStorageConfig(
        bucket = ATTACHMENT_BUCKET,
        internalEndpoint = AttachmentStorageTestContainer.endpoint,
        publicEndpoint = AttachmentStorageTestContainer.endpoint,
        accessKey = ATTACHMENT_ACCESS_KEY,
        secretKey = ATTACHMENT_SECRET_KEY,
    )

    return embeddedServer(Netty, port = 0, host = "127.0.0.1") {
        install(Tracing.plugin)
        install(AutoHeadResponse)
        configureSerialization()
        configureAuthentication(TEST_JWT_SECRET)
        install(RequireApiVersion) {
            pathPrefixes += DATA_API_MOUNT_PATH
            exemptPaths += listOf(DATA_API_MOUNT_PATH, "$DATA_API_MOUNT_PATH/", "$DATA_API_MOUNT_PATH/openapi.json")
            exemptSuffixes += "/download"
        }
        install(Koin) {
            modules(
                module {
                    single<MeterRegistry> { SimpleMeterRegistry() }
                    single { postgrest }
                    single { ApiDocs(flexConfig) }
                    single<EntityRepository> { EntityRepositoryImpl() }
                    single { EntityLookup(get()) }
                    single<AttachmentStorageService> { S3AttachmentStorageService(attachmentStorageConfig) }
                    single<ControllableUnitRepository> { ControllableUnitRepositoryImpl() }
                    single<AccountingPointService> { AccountingPointServiceImpl(AccountingPointRepositoryImpl()) }
                    single<SharedAccountingPointService> {
                        SharedAccountingPointServiceImpl(
                            SharedAccountingPointRepositoryImpl(),
                            MeteringGridAreaRepositoryImpl(),
                            AccountingPointMeteringGridAreaRepositoryImpl(),
                            AccountingPointGridLocationRepositoryImpl(),
                            SubstationRepositoryImpl(),
                            AdapterHttpClient(AdapterClientConfig(adapterConfig.baseUrl, adapterConfig.apiKey)),
                            SharedControllableUnitRepositoryImpl(),
                        )
                    }
                    single<EventRepository> { EventRepositoryImpl() }
                    single<PartyService> { PartyServiceImpl(PartyRepositoryImpl()) }
                    single { FlexMetrics(get()) }
                    single {
                        ControllableUnitLookup(get(), get(), get(), get(), get(), get(), adapterConfig, flexConfig)
                    }
                },
            )
        }
        controllableUnitRoutes()
        attachmentRoutes()
        entityRoutes()
        apiDocsRoutes()
        dataApiRoutes()
        notFoundRoute()
    }
}
