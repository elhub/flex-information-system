package no.elhub.flex.metrics

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.prometheusmetrics.PrometheusConfig
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

@Module
class MetricsModule {

    @Single(binds = [MeterRegistry::class])
    fun provideMeterRegistry(): PrometheusMeterRegistry = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)
}
