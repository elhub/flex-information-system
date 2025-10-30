# Suspension

## Definition of suspension

ACERs recommendation for NC DR has two mentions of "suspension procedures".

> Article 27
>
> (d) a ‘suspension procedure’ allowing system operators to suspend the
> qualification of a service provider, SPU or SPG;

and

> Article 28
>
> (c) a ‘suspension procedure’ allowing entitled parties to suspend controllable
> units and ensuring that all affected parties are notified
> [without undue delay];

What does it mean to suspend? The word has many nuances, but a good definition
is to stop something from being active.

The suspension can either be temporary or permanent, but the context of the ACER
recommendation suggests that it is *temporary* - for a *period of time*.

Another aspect of suspension is that it is *sometimes* considered as a
punishment because someone has done something wrong. We do *not* interpret
suspension to signal or exclusively be about sanctioning, but rather just a way
to enforce or convey temporary deactivation. Suspension thus works as either
a sanctioning option or a safety valve when issues occur.

A broad definition of suspension also implies that it can be done both by the
party that is doing the activity (I am suspending my activity), but also by
someone else (You must suspend your activity). We consider suspension in this
context to only apply to situations where one party suspends an activity on of
another. In cases where a service provider needs to temporarily pause its
activities at the CU or SPG level, we see this as a temporary deactivation and
will follow a separate deactivation processes.

In total, our definition of suspension is:

> Suspension: Temporary deactivation done by entitled parties to pause
> another party's activities.

## Suspension in the Flexibility Information System

Suspension is done by an entitled system operator and is registered in the
flexibility information system (FIS) by creating a relevant suspension. By
registering it in the FIS, the relevant service provider will be made aware of
the suspension.

We consider adding and lifting a suspension to be instantaneus. Meaning that there
is no possibility to register suspension or reinstatement in FIS ahead in time.

When suspending, the system operator must include the reason for suspension. The
reasons for suspension is a predefined list. There are two reasons for that. The
first is that the system operator is only allowed to suspend for valid reasons.
The other is that it allows for a greater degree of automation in the processes.

Depending on the reason for suspension, the system operator should warn the
service provider in advance of the suspension. The reasons for suspension that
require a warning in advance of the suspension - and how that warning is
conveyed - must be specified in the national terms and conditions.

End users should not be notified about or view the suspension in FIS. Service
providers will notify end users when necessary and depending on the agreement
between them and the end user.

Suspension is a powerful tool as suspension will impact the [ready for market](https://elhub.github.io/flex-information-system/concepts/ready-for-market/)
status of either the SP, SPG or CU. The system operator should consider using
other tools before suspending due to the significant impact of a suspension.

## Who can suspend?

Suspension can happen on all levels. It can be on both regular resources and the
one that represents relationships (like product qualification).

| Level                                                                     | Who |
|---------------------------------------------------------------------------|-----|
| [CU](../processes/controllable-unit-suspension.md)                        | ISO |
| [SPG Grid](../processes/service-providing-group-grid-suspension.md)       | ISO |
| [SP Product](../processes/service-provider-product-suspension.md)         | PSO |
| [SPG Product](../processes/service-providing-group-product-suspension.md) | PSO |
| SP suspension                                                             | RME |

SP suspension must be technically done by FISO.
