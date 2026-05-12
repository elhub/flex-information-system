package no.elhub.flex.integration.accountingpointadapter

import com.github.tomakehurst.wiremock.WireMockServer
import com.github.tomakehurst.wiremock.client.MappingBuilder
import com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig
import io.kotest.core.listeners.AfterSpecListener
import io.kotest.core.listeners.BeforeSpecListener
import io.kotest.core.spec.Spec

object AccountingPointAdapterWireMockServer : BeforeSpecListener, AfterSpecListener {
    private val server = WireMockServer(
        wireMockConfig()
            .dynamicPort()
            .usingFilesUnderClasspath("wiremock/accountingpointadapter"),
    )

    fun baseUrl(): String = server.baseUrl()

    fun stubFor(mappingBuilder: MappingBuilder) = server.stubFor(mappingBuilder)

    fun resetAll() = server.resetAll()

    override suspend fun beforeSpec(spec: Spec) {
        server.start()
    }

    override suspend fun afterSpec(spec: Spec) {
        server.stop()
    }
}
