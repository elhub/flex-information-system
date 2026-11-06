package no.elhub.flex.api.routes.data

import com.github.tomakehurst.wiremock.WireMockServer
import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.containing
import com.github.tomakehurst.wiremock.client.WireMock.delete
import com.github.tomakehurst.wiremock.client.WireMock.deleteRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.equalTo
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.matching
import com.github.tomakehurst.wiremock.client.WireMock.patch
import com.github.tomakehurst.wiremock.client.WireMock.post
import com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor
import com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo
import com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldStartWith
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.application.install
import io.ktor.server.testing.TestApplication
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import no.elhub.flex.api.auth.FlexAuthentication
import no.elhub.flex.api.config.PostgrestConfig
import no.elhub.flex.api.config.RequireApiVersion
import no.elhub.flex.api.config.Tracing
import no.elhub.flex.api.config.configureSerialization
import no.elhub.flex.api.postgrest.PostgrestClient
import no.elhub.flex.api.util.TEST_JWT_SECRET
import no.elhub.flex.api.util.makeJwt
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin

private const val VERSION = "2026-06-08"

class DataApiRoutesTest :
    FunSpec({
        val postgrest = WireMockServer(wireMockConfig().dynamicPort())
        lateinit var app: TestApplication

        fun token(scope: String = "manage:data") = makeJwt(role = "flex_organisation", scope = scope)

        beforeSpec {
            postgrest.start()
            val client = PostgrestClient(PostgrestConfig(postgrest.baseUrl()))
            app = TestApplication {
                application {
                    install(Tracing.plugin)
                    configureSerialization()
                    install(FlexAuthentication) { jwtSecret = TEST_JWT_SECRET }
                    install(RequireApiVersion) { exemptSuffixes += "/download" }
                    install(Koin) {
                        modules(
                            module {
                                single<MeterRegistry> { SimpleMeterRegistry() }
                                single { client }
                            },
                        )
                    }
                    dataApiRoutes()
                }
            }
        }

        afterSpec {
            app.stop()
            postgrest.stop()
        }

        beforeTest { postgrest.resetAll() }

        context("reading") {
            test("a list request is forwarded with query, credentials and trace context") {
                postgrest.stubFor(
                    get(urlPathEqualTo("/controllable_unit")).willReturn(
                        aResponse()
                            .withStatus(206)
                            .withHeader("Content-Type", "application/json; charset=utf-8")
                            .withHeader("Content-Range", "0-0/2")
                            .withBody("""[{"id":1}]"""),
                    ),
                )

                val jwt = token()
                val response = app.client.get("/controllable_unit?name=eq.x&limit=1") {
                    header("Authorization", "Bearer $jwt")
                    header("Api-Version", VERSION)
                    header("Range", "0-0")
                    header("Cookie", "secret=1")
                }

                response.status shouldBe HttpStatusCode.PartialContent
                response.bodyAsText() shouldBe """[{"id":1}]"""
                response.headers["Content-Range"] shouldBe "0-0/2"
                response.headers["Api-Version"] shouldBe VERSION
                response.headers["Content-Type"]!! shouldContain "application/json"

                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/controllable_unit"))
                        .withQueryParam("name", equalTo("eq.x"))
                        .withQueryParam("limit", equalTo("1"))
                        .withHeader("Authorization", equalTo("Bearer $jwt"))
                        .withHeader("Range", equalTo("0-0"))
                        .withHeader("traceparent", matching("00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}"))
                        .withoutHeader("Cookie"),
                )
            }

            test("a single resource is requested as one object by id") {
                postgrest.stubFor(get(urlPathEqualTo("/controllable_unit")).willReturn(aResponse().withBody("""{"id":12}""")))

                val response = app.client.get("/controllable_unit/12") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                }

                response.status shouldBe HttpStatusCode.OK
                response.bodyAsText() shouldBe """{"id":12}"""
                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/controllable_unit"))
                        .withQueryParam("id", equalTo("eq.12"))
                        .withHeader("Accept", equalTo("application/vnd.pgrst.object+json")),
                )
            }

            test("the session cookie is sent on as a bearer token") {
                postgrest.stubFor(get(urlPathEqualTo("/product_type")).willReturn(aResponse().withBody("[]")))

                val jwt = token()
                app.client.get("/product_type") {
                    header("Cookie", "__Host-flex_session=$jwt")
                    header("Api-Version", VERSION)
                }.status shouldBe HttpStatusCode.OK

                postgrest.verify(getRequestedFor(urlPathEqualTo("/product_type")).withHeader("Authorization", equalTo("Bearer $jwt")))
            }

            test("the scheme of the Authorization header is case-insensitive") {
                postgrest.stubFor(get(urlPathEqualTo("/product_type")).willReturn(aResponse().withBody("[]")))

                val jwt = token()
                app.client.get("/product_type") {
                    header("Authorization", "bearer $jwt")
                    header("Api-Version", VERSION)
                }.status shouldBe HttpStatusCode.OK

                postgrest.verify(getRequestedFor(urlPathEqualTo("/product_type")).withHeader("Authorization", equalTo("Bearer $jwt")))
            }

            test("an Authorization header that is not a bearer token is not sent on") {
                postgrest.stubFor(get(urlPathEqualTo("/product_type")).willReturn(aResponse().withBody("[]")))

                app.client.get("/product_type") {
                    header("Authorization", "Basic dXNlcjpwYXNz")
                    header("Api-Version", VERSION)
                }.status shouldBe HttpStatusCode.OK

                postgrest.verify(getRequestedFor(urlPathEqualTo("/product_type")).withoutHeader("Authorization"))
            }

            test("embed becomes select, and valid_at a filter") {
                postgrest.stubFor(get(urlPathEqualTo("/controllable_unit")).willReturn(aResponse().withBody("[]")))

                app.client.get("/controllable_unit?embed=accounting_point&valid_at=2024-01-15T10:30:00Z") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                }.status shouldBe HttpStatusCode.OK

                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/controllable_unit"))
                        .withQueryParam("select", equalTo("*,accounting_point(*)"))
                        .withQueryParam("and", containing("valid_from.lte.2024-01-15T10:30:00Z"))
                        .withoutQueryParam("embed")
                        .withoutQueryParam("valid_at"),
                )
            }

            test("a single notice can be read by id") {
                postgrest.stubFor(get(urlPathEqualTo("/notice")).willReturn(aResponse().withBody("""{"id":22}""")))

                val response = app.client.get("/notice/22") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                }

                response.status shouldBe HttpStatusCode.OK
                response.bodyAsText() shouldBe """{"id":22}"""
                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/notice"))
                        .withQueryParam("id", equalTo("eq.22"))
                        .withHeader("Accept", equalTo("application/vnd.pgrst.object+json")),
                )
            }

            test("event filters on source go through the event_source function") {
                postgrest.stubFor(get(urlPathEqualTo("/rpc/event_source")).willReturn(aResponse().withBody("[]")))

                app.client.get("/event?source=eq./controllable_unit/5") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                }.status shouldBe HttpStatusCode.OK

                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/rpc/event_source"))
                        .withQueryParam("source_resource", equalTo("controllable_unit"))
                        .withQueryParam("source_id", equalTo("5")),
                )
            }

            test("attachments are read from the attachment schema, and listing needs the application") {
                postgrest.stubFor(
                    get(urlPathEqualTo("/service_providing_group_product_application_attachment")).willReturn(aResponse().withBody("[]")),
                )

                val jwt = token(scope = "manage:attachment")
                app.client.get("/service_providing_group_product_application_attachment") {
                    header("Authorization", "Bearer $jwt")
                    header("Api-Version", VERSION)
                }.status shouldBe HttpStatusCode.BadRequest

                app.client.get(
                    "/service_providing_group_product_application_attachment?service_providing_group_product_application_id=eq.1",
                ) {
                    header("Authorization", "Bearer $jwt")
                    header("Api-Version", VERSION)
                }.status shouldBe HttpStatusCode.OK

                postgrest.verify(
                    getRequestedFor(urlPathEqualTo("/service_providing_group_product_application_attachment"))
                        .withHeader("Accept-Profile", equalTo("attachment")),
                )

                // data scopes do not give access to attachments
                app.client.get(
                    "/service_providing_group_product_application_attachment?service_providing_group_product_application_id=eq.1",
                ) {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                }.status shouldBe HttpStatusCode.Forbidden
            }
        }

        context("writing") {
            test("POST sends the body and asks for the created object") {
                postgrest.stubFor(post(urlPathEqualTo("/party")).willReturn(aResponse().withStatus(201).withBody("""{"id":3}""")))

                val response = app.client.post("/party") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                    contentType(ContentType.Application.Json)
                    setBody("""{"name":"p"}""")
                }

                response.status shouldBe HttpStatusCode.Created
                response.bodyAsText() shouldBe """{"id":3}"""
                postgrest.verify(
                    postRequestedFor(urlPathEqualTo("/party"))
                        .withRequestBody(equalTo("""{"name":"p"}"""))
                        .withHeader("Content-Type", containing("application/json"))
                        .withHeader("Prefer", equalTo("return=representation"))
                        .withHeader("Accept", equalTo("application/vnd.pgrst.object+json")),
                )
            }

            test("PATCH of something the caller cannot update gets a friendly error") {
                postgrest.stubFor(
                    patch(urlPathEqualTo("/party")).willReturn(
                        aResponse().withStatus(406).withBody(
                            """{"code":"PGRST116","message":"JSON object requested, multiple (or no) rows returned","details":"0 rows"}""",
                        ),
                    ),
                )

                val response = app.client.patch("/party/3") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                    contentType(ContentType.Application.Json)
                    setBody("""{"name":"p"}""")
                }

                response.status shouldBe HttpStatusCode.NotAcceptable
                val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
                body.getValue("code").jsonPrimitive.content shouldBe "PGRST116"
                body.getValue("message").jsonPrimitive.content shouldBe "User cannot update this resource"
                body.getValue("details").jsonPrimitive.content shouldBe "0 rows"
            }

            test("DELETE passes on a response without content") {
                postgrest.stubFor(delete(urlPathEqualTo("/party_membership")).willReturn(aResponse().withStatus(204)))

                val response = app.client.delete("/party_membership/3") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                }

                response.status shouldBe HttpStatusCode.NoContent
                response.bodyAsText() shouldBe ""
                postgrest.verify(deleteRequestedFor(urlPathEqualTo("/party_membership")).withQueryParam("id", equalTo("eq.3")))
            }
        }

        context("access") {
            test("anonymous callers can read data, without sending credentials to PostgREST") {
                postgrest.stubFor(get(urlPathEqualTo("/product_type")).willReturn(aResponse().withBody("[]")))

                app.client.get("/product_type") { header("Api-Version", VERSION) }.status shouldBe HttpStatusCode.OK

                postgrest.verify(getRequestedFor(urlPathEqualTo("/product_type")).withoutHeader("Authorization"))
            }

            test("anonymous callers cannot write") {
                val response = app.client.post("/party") {
                    header("Api-Version", VERSION)
                    contentType(ContentType.Application.Json)
                    setBody("{}")
                }

                response.status shouldBe HttpStatusCode.Forbidden
                postgrest.verify(0, postRequestedFor(urlPathEqualTo("/party")))
            }

            test("a token without enough scope is forbidden") {
                val response = app.client.get("/party") {
                    header("Authorization", "Bearer ${token(scope = "read:data:product_type")}")
                    header("Api-Version", VERSION)
                }

                response.status shouldBe HttpStatusCode.Forbidden
                response.headers["WWW-Authenticate"] shouldBe """Bearer error="insufficient_scope", scope="read:data:party""""
                val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
                body.getValue("code").jsonPrimitive.content shouldBe "HTTP403"
                body.getValue("details").jsonPrimitive.content shouldBe "insufficient scope"
                postgrest.verify(0, getRequestedFor(urlPathEqualTo("/party")))
            }

            test("an invalid token is unauthorized") {
                val response = app.client.get("/product_type") {
                    header("Authorization", "Bearer not-a-jwt")
                    header("Api-Version", VERSION)
                }

                response.status shouldBe HttpStatusCode.Unauthorized
                response.headers["WWW-Authenticate"]!! shouldStartWith """Bearer error="invalid_token", error_description=""""
            }

            test("an embedded resource without scope is forbidden, naming the scope in the challenge") {
                val response = app.client.get("/controllable_unit?embed=accounting_point") {
                    header("Authorization", "Bearer ${token(scope = "read:data:controllable_unit")}")
                    header("Api-Version", VERSION)
                }

                response.status shouldBe HttpStatusCode.Forbidden
                response.headers["WWW-Authenticate"] shouldBe
                    """Bearer error="insufficient_scope", scope="read:data:accounting_point""""
            }

            test("a malformed embed is rejected before reaching PostgREST") {
                app.client.get("/controllable_unit?embed=a!(") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                }.status shouldBe HttpStatusCode.BadRequest
                postgrest.verify(0, getRequestedFor(urlPathEqualTo("/controllable_unit")))
            }
        }

        context("api version") {
            test("is required") {
                app.client.get("/product_type").status shouldBe HttpStatusCode.BadRequest
                app.client.get("/product_type") { header("Api-Version", "1999-01-01") }.status shouldBe HttpStatusCode.BadRequest
            }
        }

        context("large responses") {
            test("a large successful body is relayed in full") {
                val body = "[" + (1..200_000).joinToString(",") { """{"id":$it}""" } + "]"
                postgrest.stubFor(get(urlPathEqualTo("/event")).willReturn(aResponse().withBody(body)))

                val response = app.client.get("/event") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                }

                response.status shouldBe HttpStatusCode.OK
                response.bodyAsText() shouldBe body
            }

            test("an oversized error body gives the generic error") {
                postgrest.stubFor(
                    get(urlPathEqualTo("/event")).willReturn(
                        aResponse().withStatus(500).withBody("x".repeat(3 * 1024 * 1024)),
                    ),
                )

                val response = app.client.get("/event") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                }

                response.status shouldBe HttpStatusCode.InternalServerError
                Json.parseToJsonElement(response.bodyAsText()).jsonObject.getValue("code").jsonPrimitive.content shouldBe "HTTP500"
            }
        }

        context("error responses") {
            test("keep the headers of PostgREST, with the rewritten body") {
                postgrest.stubFor(
                    get(urlPathEqualTo("/product_type")).willReturn(
                        aResponse()
                            .withStatus(416)
                            .withHeader("Content-Range", "*/0")
                            .withHeader("WWW-Authenticate", "Bearer")
                            .withBody("""{"code":"PGRST103","message":"Requested range not satisfiable"}"""),
                    ),
                )

                val response = app.client.get("/product_type") {
                    header("Authorization", "Bearer ${token()}")
                    header("Api-Version", VERSION)
                }

                response.status shouldBe HttpStatusCode.RequestedRangeNotSatisfiable
                response.headers["Content-Range"] shouldBe "*/0"
                response.headers["WWW-Authenticate"] shouldBe "Bearer"
                response.headers["Content-Length"]?.toInt() shouldBe response.bodyAsText().toByteArray().size
                Json.parseToJsonElement(response.bodyAsText()).jsonObject.getValue("code").jsonPrimitive.content shouldBe "PGRST103"
            }
        }

        context("unknown routes") {
            test("are a JSON not found, and never reach PostgREST") {
                for ((path, method) in listOf("/nope" to "GET", "/service_providing_group_product_application_attachment_history" to "GET", "/party" to "PUT", "/rpc/anything" to "GET")) {
                    val response = when (method) {
                        "PUT" -> app.client.post("/party/1/extra") { header("Api-Version", VERSION) }
                        else -> app.client.get(path) { header("Api-Version", VERSION) }
                    }

                    response.status shouldBe HttpStatusCode.NotFound
                    val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
                    body.getValue("code").jsonPrimitive.content shouldBe "HTTP404"
                }
                postgrest.allServeEvents.size shouldBe 0
            }
        }

        context("PostgREST unavailable") {
            test("is a bad gateway") {
                val unreachable = PostgrestClient(PostgrestConfig("http://127.0.0.1:1"))
                val brokenApp = TestApplication {
                    application {
                        configureSerialization()
                        install(Tracing.plugin)
                        install(Koin) { modules(module { single { unreachable } }) }
                        dataApiRoutes()
                    }
                }

                val response = brokenApp.client.get("/product_type")
                response.status shouldBe HttpStatusCode.BadGateway
                brokenApp.stop()
            }
        }
    })
