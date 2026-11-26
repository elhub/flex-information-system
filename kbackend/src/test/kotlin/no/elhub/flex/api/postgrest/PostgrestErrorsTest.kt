package no.elhub.flex.api.postgrest

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import no.elhub.flex.api.model.dto.generated.models.ErrorMessage

class PostgrestErrorsTest :
    FunSpec({
        test("keeps the PostgREST error fields") {
            rewritePostgrestError(
                HttpMethod.Get,
                HttpStatusCode.BadRequest,
                """{"code":"22P02","message":"bad input","details":"d","hint":"h"}""",
            ) shouldBe ErrorMessage(code = "22P02", message = "bad input", details = "d", hint = "h")
        }

        test("empty details and hints are left out") {
            rewritePostgrestError(
                HttpMethod.Get,
                HttpStatusCode.BadRequest,
                """{"code":"X","message":"m","details":"","hint":null}""",
            ) shouldBe ErrorMessage(code = "X", message = "m")
        }

        test("bodies not in PostgREST format get a generic error") {
            rewritePostgrestError(HttpMethod.Get, HttpStatusCode.NotFound, "<html>nope</html>") shouldBe
                ErrorMessage(code = "HTTP404", message = "404 Not Found")
            rewritePostgrestError(HttpMethod.Get, HttpStatusCode.BadGateway, """{"message":"x"}""") shouldBe
                ErrorMessage(code = "HTTP502", message = "502 Bad Gateway")
        }

        test("PATCH of a resource the user cannot see is reported as not updatable") {
            rewritePostgrestError(
                HttpMethod.Patch,
                HttpStatusCode.NotAcceptable,
                """{"code":"PGRST116","message":"JSON object requested, multiple (or no) rows returned"}""",
            ).message shouldBe "User cannot update this resource"
        }

        test("POST rejected by row-level security or a duplicate key gets a friendlier message") {
            rewritePostgrestError(
                HttpMethod.Post,
                HttpStatusCode.Forbidden,
                """{"code":"42501","message":"new row violates row-level security policy for table \"x\""}""",
            ).message shouldBe "User cannot create this resource"

            rewritePostgrestError(
                HttpMethod.Post,
                HttpStatusCode.Conflict,
                """{"code":"23505","message":"duplicate key value violates unique constraint \"x\""}""",
            ).message shouldBe "Duplicate found, please try to update the existing resource instead"
        }

        test("the same messages are not rewritten for other methods") {
            rewritePostgrestError(
                HttpMethod.Get,
                HttpStatusCode.Forbidden,
                """{"code":"42501","message":"new row violates row-level security policy"}""",
            ).message shouldBe "new row violates row-level security policy"
        }
    })
