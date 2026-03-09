package no.elhub.flex

import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureMonitoring
import no.elhub.flex.config.configureRouting
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.controllableunit.lookup.ControllableUnitLookup
import no.elhub.flex.flexprivate.FlexPrivateService
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin

fun defaultTestApplication(): TestApplication =
    TestApplication {
        application {
            this.install(Tracing.plugin)
            configureLogging()
            configureMonitoring()
            configureSerialization()
            install(Koin) {
                modules(
                    module {
                        single<FlexPrivateService> {
                            object : FlexPrivateService {
                                override suspend fun fetchMeteringGridArea(
                                    accountingPointBusinessId: String,
                                ): arrow.core.Either<String, String> =
                                    arrow.core.Either.Right("")
                            }
                        }
                        single<ControllableUnitRepository> {
                            object : ControllableUnitRepository {
                                context(token: no.elhub.flex.auth.AccessToken)
                                override fun getCurrentAccountingPoint(cuBusinessId: String) =
                                    arrow.core.Either.Left(
                                        no.elhub.flex.controllableunit.db.NotFoundError("stub"),
                                    )

                                context(token: no.elhub.flex.auth.AccessToken)
                                override fun getAccountingPointIdByBusinessId(apBusinessId: String) =
                                    arrow.core.Either.Left(
                                        no.elhub.flex.controllableunit.db.NotFoundError("stub"),
                                    )

                                context(token: no.elhub.flex.auth.AccessToken)
                                override fun upsertAccountingPointMeteringGridArea(
                                    apBusinessId: String,
                                    mgaBusinessId: String,
                                    endUserBusinessId: String,
                                ) = arrow.core.Either.Left(
                                    no.elhub.flex.controllableunit.db.DatabaseError("stub"),
                                )

                                context(token: no.elhub.flex.auth.AccessToken)
                                override fun checkEndUserMatchesAccountingPoint(
                                    endUserBusinessId: String,
                                    apBusinessId: String,
                                ) = arrow.core.Either.Left(
                                    no.elhub.flex.controllableunit.db.NotFoundError("stub"),
                                )

                                context(token: no.elhub.flex.auth.AccessToken)
                                override fun lookupControllableUnits(
                                    cuBusinessId: String,
                                    apBusinessId: String,
                                ) = arrow.core.Either.Left(
                                    no.elhub.flex.controllableunit.db.DatabaseError("stub"),
                                )
                            }
                        }
                        single { ControllableUnitLookup(get(), get()) }
                    },
                )
            }
            configureRouting()
        }
    }
