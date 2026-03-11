package no.elhub.flex

import arrow.core.Either
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import no.elhub.flex.auth.AccessToken
import no.elhub.flex.config.Tracing
import no.elhub.flex.config.configureLogging
import no.elhub.flex.config.configureMonitoring
import no.elhub.flex.config.configureRouting
import no.elhub.flex.config.configureSerialization
import no.elhub.flex.controllableunit.db.ControllableUnitRepository
import no.elhub.flex.controllableunit.db.DatabaseError
import no.elhub.flex.controllableunit.db.NotFoundError
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
                                ): Either<String, String> =
                                    Either.Right("")
                            }
                        }
                        single<ControllableUnitRepository> {
                            object : ControllableUnitRepository {
                                context(token: AccessToken)
                                override fun getCurrentAccountingPoint(cuBusinessId: String) =
                                    Either.Left(NotFoundError("stub"))

                                context(token: AccessToken)
                                override fun getAccountingPointIdByBusinessId(apBusinessId: String) =
                                    Either.Left(NotFoundError("stub"))

                                context(token: AccessToken)
                                override fun upsertAccountingPointMeteringGridArea(
                                    apBusinessId: String,
                                    mgaBusinessId: String,
                                    endUserBusinessId: String,
                                ) = Either.Left(DatabaseError("stub"))

                                context(token: AccessToken)
                                override fun checkEndUserMatchesAccountingPoint(
                                    endUserBusinessId: String,
                                    apBusinessId: String,
                                ) = Either.Left(NotFoundError("stub"))

                                context(token: AccessToken)
                                override fun lookupControllableUnits(
                                    cuBusinessId: String,
                                    apBusinessId: String,
                                ) = Either.Left(DatabaseError("stub"))
                            }
                        }
                        single { ControllableUnitLookup(get(), get()) }
                    },
                )
            }
            configureRouting()
        }
    }
