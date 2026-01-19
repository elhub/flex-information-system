# Authentication model

In this section, we describe the authentication model in the Flexibility
Information System. This diagran shows the main concepts in the model and how
they relate to each other.

![../diagrams/auth_model.drawio.png](../diagrams/auth_model.drawio.png)

## Identity

Any system or person interacting with the Flexibility Information System will
always be authenticated as a legal og natural _entity_, possibly assuming the
role of a market _party_. An entity might also interact with the FIS via a
client (_i.e._, an application or system). The entity, party and client together
make up the _identity_ of the user.

The entity has very little functionality available in the system, most
functionality will be available after assuming a _party_. The identity of the
user is then the combination of the entity and the party they are acting as. As
a result, in order to interact properly with the Flexibility Information System,
an entity must assume a party.

Inspiration for this step is taken from [Altinn](https://info.altinn.no/en/),
where one is presented with a list of parties upon login. The Elhub portal also
has the same type of logical mechanism.

![Altinn select party](../assets/altinn-choose-party.png).

The concept is also inspired by [AWS AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html).

Assuming a party is done using [Token Exchange](./auth-methods.md#token-exchange)
or directly in authentication using [JWT Bearer](./auth-methods.md#jwt-bearer)
grant. To assume a party, the entity must be a member of the party.

## Entity - individuals and organisations

The _entity_ is the natural or legal person using the system. This is the "raw"
identity of the user when it enters the system.

* [Natural entities](https://en.wikipedia.org/wiki/Natural_person) are
  _individuals_ identified by their national identity number (fødselsnummer) or
  D-number.
* [Legal entities](https://en.wikipedia.org/wiki/Legal_person) are
  _organisations_ identified by their organisation number (organisasjonsnummer).

In a production setting, the identity of the entity will be established through
mechanisms such as IDPorten, Maskinporten or enterprise certificates.

## Client - application or system

We follow the OAuth 2.0 definition of a client as _"an application making
protected resource requests"_. A client is basically a way for _an entity_ to
interact with the FIS API. A client can use different
[authentication methods](./auth-methods.md#authentication-methods). A client is
restricted to a specific party and with assigned scopes.

## Party - market actors

This is the market party like a system operator or service provider. Parties in
the European energy sector are typically identified by a GLN or `EIC-X`. After
being authenticated as an entity, the user can assume a party to
interact with the system.

We have two extra party types in addition to the other market actors: end users
and organisations.
An end user is either
[a person or an organisation](https://www.nve.no/reguleringsmyndigheten/regulering/kraftmarkedet/sluttbrukermarkedet/).
The organisation party is a way for the user to have access to a special role to
perform modifications on their own organisation entity.
They can for instance give total or partial (via delegation mechanisms) access
to what the entity owns and manages, to people from the same company.

We have the following party types in the Flexibility Information System:

| Abbreviation | Code                                    | Name                                    | Norwegian name                              |
|--------------|-----------------------------------------|-----------------------------------------|---------------------------------------------|
| BRP          | balance_responsible_party               | Balance Responsible Party               | _Balanseansvarlig_                          |
| EU           | end_user                                | End User                                | _Sluttbruker_                               |
| ES           | energy_supplier                         | Energy Supplier                         | _Kraftleverandør_                           |
| FISO         | flexibility_information_system_operator | Flexibility Information System Operator | _Fleksibilitetsinformasjonssystem Operatør_ |
| MO           | market_operator                         | Market Operator                         | _Markedoperatør_                            |
| ORG          | organisation                            | Organisation                            | _Organisasjon_                              |
| SO           | system_operator                         | System Operator                         | _Systemoperatør_                            |
| SP           | service_provider                        | Service Provider                        | _Tjenesteleverandør_                        |
| TP           | third_party                             | Third Party                             | _Tredjepart_                                |

!!! note "Common policies"

    In addition to these we also write policies and grant access that are common
    for all authenticated party types. This is referred to as `Common`,
    abbreviated as `COM`. All party types inherit the policies from `Common`.

The following sub-sections provides a brief description of each party type.

### Balance Responsible Party

A party responsible for its imbalances.

Based on: [Consolidated text: Commission Regulation (EU) 2017/2195 - Art.2 Definitions](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02017R2195-20220619).

### End User

Synonyms:

* _Final Customer_ (_Sluttkunde_)
* _Flexible Customer_
* _System User_

The entity at the lower end of the chain, willing to make their own technical
resources available on the flexibility market.

### Energy Supplier

Synonyms:

* _Balance Supplier_
* _Supplier_

A party delivering to or taking energy from a party connected to the grid at an
accounting point.

### Flexibility Information System Operator

Synonyms:

* _Flexibility Register Operator_

We use this as an administrator role for the Flexibility Information System, as
a last resort tool to have full authorisation on the system or perform special
operations.

### Market Operator

Sub-types:

* _Local Market Operator_
* _Balancing Market Operator_

A party that provides a service whereby the offers to sell energy are matched
with bids to buy energy.

Based on: [Consolidated text: Regulation (EU) 2019/943](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02019R0943-20220623).

### Organisation

This is not a market party as such but a party that represents the organisation
entity.

### System Operator

Synonyms:

* _Grid Owner_

Sub-types:

* _Distribution System Operator_
* _Transmission System Operator_
* _Connecting System Operator_
* _Requesting System Operator_
* _Procuring System Operator_
* _Impacted System Operator_

A party responsible for operating, ensuring the maintenance of and, if
necessary, developing the system in a given area and, where applicable, its
interconnections with other systems, and for ensuring the long-term ability of
the system to meet reasonable demands for the distribution or transmission of
energy.

Based on: [Consolidated text: Directive (EU) 2019/944](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02019L0944-20220623).

### Service Provider

Sub-types:

* _Balancing Service Provider_
* _Flexibility Service Provider_

A party that offers local or balancing services to other parties in the market,
after having successfully passed a qualification process.

### Third Party

A party that does not have an actual responsibility in the value chain, but
_can be_ delegated authority to, _e.g._, perform tasks or access data.

## Roles

Parties in the Energy sector act in different "roles". For some examples, see
the
[Elhub role model](https://elhub.no/aktorer-og-markedsstruktur/aktorenes-roller/rollemodell/).
This level is mostly used for delegation. As of now, this level is **NOT** part
of the authentication or authorization model.

!!! note "The word 'role' can be seen in the system"

    Our database and API service does sometime refer to something called
    "roles". This is just how we model parties and entities in the system and is
    not related to the conceptual authentication or authorization model as
    described here.

## Anonymous users

Some data (like party lists) and actions (such as login) will be available for
un-authenticated users. We refer to these as `Anonymous`, abbreviated as `ANON`.

An anonymous user has the following default scopes:

* `read:data` - to be able to access open data (if any)
* `use:auth` - to be able to log in etc

!!! info "Policy inheritance"

    RLA policies for `Anonymous`/`ANON` are inherited by _all authenticated users_.
