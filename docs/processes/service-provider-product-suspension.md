# SP Product Suspension

This process is used to suspend the service provider product qualification temporarily. The process can only be triggered by the procuring system operator that already qualified the service provider. The procuring system operator suspends the service providers product qualification, but the product qualification will not be suspended for other system operators. The process also includes reinstatement of the service provider qualification, i.e. removing the suspension. 

Reasons for suspension are:
* Communication issues
* Problems with service operators' systems
* Other

The system operator must include the reason for suspension when suspending a service provider for a product. The service provider will receive a notification about the suspension. 
All procuring system operators that have qualified the service provider for the same product will be notified of the suspension.

<!--Other communication between service provider and system operator will happen outside of FIS. -->
End users will not be notified about the suspension from FIS. Service providers will notify end users when necessary. 

The suspension of the SP qualification will impact [ready for market](https://elhub.github.io/flex-information-system/concepts/ready-for-market/). 

## Prerequisites

* The issue that triggers the suspension is temporary
* Adding and lifting a suspension is instantaneus, i.e. not time dependent

## Sequence

[Full Size](../diagrams/service_provider_product_suspension.png) |
[PlantUML description](../diagrams/service_provider_product_suspension.plantuml)

![Service Provider contract and termination](../diagrams/service_provider_product_suspension.png)
