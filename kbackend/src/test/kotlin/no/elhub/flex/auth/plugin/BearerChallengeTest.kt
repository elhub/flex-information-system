package no.elhub.flex.auth.plugin

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.testing.TestApplication
import no.elhub.flex.auth.scope.Scope
import no.elhub.flex.auth.scope.ScopeVerb
import no.elhub.flex.auth.util.TEST_JWT_SECRET
import no.elhub.flex.auth.util.makeJwt
import no.elhub.flex.config.configureSerialization

class BearerChallengeTest :
    FunSpec({
        context("values") {
            test("a missing token has no error code") {
                BearerChallenge.MISSING_TOKEN shouldBe "Bearer"
            }

            test("an invalid token carries the description") {
                BearerChallenge.invalidToken("Token has expired") shouldBe
                    """Bearer error="invalid_token", error_description="Token has expired""""
            }

            test("insufficient scope names the required scope") {
                BearerChallenge.insufficientScope(Scope(ScopeVerb.Use, "data:entity:lookup")) shouldBe
                    """Bearer error="insufficient_scope", scope="use:data:entity:lookup""""
            }

            test("quotes and backslashes in descriptions are escaped") {
                BearerChallenge.invalidToken("bad \"token\" \\ here") shouldBe
                    """Bearer error="invalid_token", error_description="bad \"token\" \\ here""""
            }
        }

        context("on a route requiring a scope") {
            val app = TestApplication {
                application {
                    configureSerialization()
                    configureAuthentication(TEST_JWT_SECRET)
                    authenticatedRouting {
                        route("/protected") {
                            requireScope(Scope(ScopeVerb.Use, "data:thing"))
                            get { call.respondText("ok") }
                        }
                    }
                }
            }

            afterSpec { app.stop() }

            test("no token is unauthorized with a bare Bearer challenge") {
                val response = app.client.get("/protected")

                response.status shouldBe HttpStatusCode.Unauthorized
                response.headers["WWW-Authenticate"] shouldBe "Bearer"
            }

            test("an invalid token is unauthorized with an invalid_token challenge") {
                val response = app.client.get("/protected") { header("Authorization", "Bearer nope") }

                response.status shouldBe HttpStatusCode.Unauthorized
                response.headers["WWW-Authenticate"]!!.startsWith("""Bearer error="invalid_token"""") shouldBe true
            }

            test("a token lacking the scope is forbidden with an insufficient_scope challenge") {
                val response = app.client.get("/protected") {
                    header("Authorization", "Bearer ${makeJwt(scope = "read:data")}")
                }

                response.status shouldBe HttpStatusCode.Forbidden
                response.headers["WWW-Authenticate"] shouldBe """Bearer error="insufficient_scope", scope="use:data:thing""""
                response.bodyAsText().contains("insufficient scope") shouldBe true
            }

            test("a token with the scope is let through") {
                val response = app.client.get("/protected") {
                    header("Authorization", "Bearer ${makeJwt(scope = "manage:data")}")
                }

                response.status shouldBe HttpStatusCode.OK
                response.headers["WWW-Authenticate"] shouldBe null
            }
        }
    })
