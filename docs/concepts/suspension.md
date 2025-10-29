# Suspension

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
to enforce or convey temporary deactivation.

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

Suspension is done by an entitled system operator and is registered in the
flexibility information system (FIS) by creating a relevant suspension.By
registering it in the FIS, the relevant service provider will be made aware of
the suspension.

We consider adding and lifting a suspension to be instantaneus. Meaning that there
is no reason to register suspension or reinstatement in FIS ahead in time.

When suspending, the system operator must include the reason for suspension. The
reason for suspension is a predefined list. There are two reasons for that. The
first is that the PSO is only allowed to suspend for valid reasons. The other is
that it allows for a greater degree of automation in the process.

Depending on the reason for suspension, the system operator should warn the
service provider in advance of the suspension. The reasons for suspension that
require a warning in advance of the suspension - and how that warning is
conveyed - must be specified in the national terms and conditions.

## Suspension processes

The suspension processes are:

* [CU Suspension](../processes/controllable-unit-suspension.md)
* [SPG Grid Suspension](../processes/service-providing-group-grid-suspension.md)
* [SP Product Suspension](../processes/service-provider-product-suspension.md)
* [SPG Product Suspension](../processes/service-providing-group-product-suspension.md)
* SP suspension

## Who can suspend?

Suspension can happen on all levels. It can be on both regular resources and the
one that represent relationships (like product applications).

| Level                     | AKA              | Who | Comment                          |
|---------------------------|------------------|-----|----------------------------------|
| CU Grid Validation        |                  | ISO |                                  |
| SPG Grid Prequalification |                  | ISO |                                  |
| SPG Product Application   | Prequalification | PSO |                                  |
| SP Product Application    | Qualification    | PSO |                                  |
| SP                        | Approval         | RME | Must techincally be done by FISO |
