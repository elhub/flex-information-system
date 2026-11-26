package no.elhub.flex

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.wait.strategy.Wait
import org.testcontainers.utility.DockerImageName
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

data class ReceivedMail(val to: List<String>, val subject: String, val html: String)

object MailpitTestContainer {

    private const val SMTP_PORT = 1025
    private const val HTTP_PORT = 8025
    private const val MAIL_PIT_VERSION = "v1.31"

    private val container: GenericContainer<*> =
        GenericContainer(DockerImageName.parse("axllent/mailpit:${MAIL_PIT_VERSION}"))
            .withExposedPorts(SMTP_PORT, HTTP_PORT)
            .waitingFor(Wait.forHttp("/livez").forPort(HTTP_PORT))

    private val http = HttpClient.newHttpClient()

    init {
        container.start()
    }

    val host: String get() = container.host
    val smtpPort: Int get() = container.getMappedPort(SMTP_PORT)

    private fun api(path: String) = URI("http://${container.host}:${container.getMappedPort(HTTP_PORT)}/api/v1/$path")

    private fun getMessages(path: String): JsonObject =
        Json.parseToJsonElement(
            http.send(HttpRequest.newBuilder(api(path)).GET().build(), HttpResponse.BodyHandlers.ofString()).body()
        ).jsonObject

    fun clearMessages() {
        http.send(HttpRequest.newBuilder(api("messages")).DELETE().build(), HttpResponse.BodyHandlers.discarding())
    }

    /** Returns all stored messages. */
    fun messages(): List<ReceivedMail> =
        getMessages("messages")["messages"]?.jsonArray.orEmpty().map { summary ->
            val id = summary.jsonObject.getValue("ID").jsonPrimitive.content
            val message = getMessages("message/$id")
            ReceivedMail(
                to = message.getValue("To").jsonArray.map { it.jsonObject.getValue("Address").jsonPrimitive.content },
                subject = message.getValue("Subject").jsonPrimitive.content,
                html = message.getValue("HTML").jsonPrimitive.content,
            )
        }

    private fun JsonArray?.orEmpty(): JsonArray = this ?: JsonArray(emptyList())
}
