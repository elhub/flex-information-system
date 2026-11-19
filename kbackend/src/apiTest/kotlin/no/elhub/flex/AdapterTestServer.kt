package no.elhub.flex

import com.github.tomakehurst.wiremock.WireMockServer
import com.github.tomakehurst.wiremock.client.MappingBuilder
import com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig

/** Stands in for the accounting point adapter. Nothing is stubbed by default, so the adapter answers 404. */
object AdapterTestServer {

    private val server = WireMockServer(wireMockConfig().dynamicPort()).also { it.start() }

    val baseUrl: String
        get() = server.baseUrl()

    fun stubFor(mapping: MappingBuilder) = server.stubFor(mapping)

    fun reset() = server.resetAll()
}
