# Operations Schema

The `operations` is where we provide operational monitoring and observability
functionality for the Flex Information System.

## Metrics

The metrics view is a way to expose operational metrics from the database. It is
intended to be scraped by Prometheus at some point, and therefore looks a bit
like the [Prometheus exposition
format](https://prometheus.io/docs/instrumenting/exposition_formats/).
