# End Users

!!! note "Work in progress"

    This is a work document for work group 4 in EuroFlex intended for input and discussion.

## Context

End users (*or final customers/system users*) are the owners of the controllable
units. An end user in the power market is a Norwegian legal entity and can be an

- Individual - a natural person – identified by their birth or D-number
- Organization – a legal person – identified by their organization number

The end user on a controllable unit is the end user of the accounting point
where the controllable unit is connected. The authoritative source for who is
the end user on an accounting point is the Norwegian power market's central data
hub Elhub. The end user on a metering point change as people and organizations
move, new metering points are established and similar. In a production setting,
the end user of accounting points will be synced from Elhub to FIS.

A FIS can strengthen the end user rights by providing transparency and insight
into how their controllable units are used and who has access to their data.

But how will the end user interact with the FIS and the business processes? This
document discusses and suggests answers to that question.

## Experience from Elhub

Elhub is in many ways comparable to the FIS. It, too, deals with end users,
personal data, contracts with providers and similar. In general, Elhub provides
end users insight into their electricity data, but the actual data in the system
is added and maintained by the professional marked parties - energy suppliers
and system operators. However, the end user is also required to take part in
giving consent to contract changes and approve access to third parties. The
following two sub-sections gives a brief history of those two.

### *Non digital users*

``` text
Elhub market processes must support non-digital end users since everyone should
have access to electricity. We believe that FIS does not have this requirement
since providing flexibility is not a basic requirement for living.
```

## Energy supplier change

A supplier change in Elhub is when an energy supplier becomes the supplier for
an end user and metering point. Among other things, this gives the energy
supplier access to the data of the metering point.

When Elhub was first introduced, the supplier change was fully done by the
professional marked parties, with no interaction from the end user. The contract
with and consent from the end user was an implicit prerequisite and assumed.
This trust-based approach lasted for a few years, but is replaced by regulation
that requires the energy supplier to get secure consent from the end user and
that consent control is done in Elhub. This effectively means that the supplier
must prove that they have a contract with the end user for a supplier change to
be approved by the system.

Secure consent is done when the supplier establishes a contract with the end
user. The requirement is for digital consent, and it can be logically split in
five parts.

1. **Strong electronic identification** - Accurate identification of the user,
typically achieved through IDPorten or BankID. Roles in Altinn are used for
organizations. This identification must at least be done once, e.g. at the first
account creation.
2. **Strong authentication** – Mandatory multifactor authentication of the user
   at the time of consent proves that it is the actual user of the account that
   is giving consent.
3. **Recorded** – The consent/contract must be digitally stored so that the supplier
can show that the end user gave consent.
4. **Checkable** – The digitally recorded consent must be digitally checkable so
   that a machine can know both who gave consent and what they gave consent to.
   This impacts the format of the record.
5. **Verifiable** – The consent record must be trustworthy. In practical terms this
means it must be signed or obtained via a trusted party.

Consent verification is done by Elhub when an energy supplier initiates a
supplier change. Elhub supports verification of [two methods of secure consent](https://elhub.no/elhub-tilbyr-to-alternative-losninger-for-samtykkekontroll/).

1. consent done/obtained in the Elhub system
2. documents signed via approved/trusted vendors

## Third party access

Third parties in the Elhub system are parties that are given access and
subscription to an end users data in the system, per metering point.

The
[regular process to get access](https://dok.elhub.no/e27/brs-no-622-oppdatering-av-tredjeparts-tilgang)
is initiated by the third party requesting access through the Elhub API. The end
user then must log into MinSide at Elhub to approve that access. This process
has had some challenges, for instance requiring workarounds for approving access
for organizations with
[complex org-structure and many metering points](https://elhub.no/aktorer-og-markedsstruktur/oppgaver-i-elhub/veiledere/veileder-for-manuell-bypass-av-tilgangsforesporsel/).
To improve the process for individuals a
[URL/redirect flow](https://dok.elhub.no/e27/brs-no-624-oppdatering-av-tredjepartstilgang-via-u)
has also been introduced.

## End user involvement in Network Code Demand Response (NCDR)

Our work in EuroFlex WG4 leans heavily on NC DR. The network code is still being
developed, and we have seen varying levels and modes of end user involvement in
the processes and principles outlined in different drafts.

At the time of writing, the general feel/principle outlined in the current draft
is that it is the professional market parties that will interact with FIS. The
end user will interact with and make agreements with the providers but is not
required nor entitled to give consent or dissent in the FIS. The end user should
have full insight and transparency into their data in the FIS.

Providing access to data for other parties is not covered by the network code.

## End users in the FIS

We suggest piloting a concept where changing data in the FIS will generally be
done by the professional market parties in the value chain. This is in line with
both Elhub and NC DR. As an example, a service provider will sign a contract
with an end user, then interact with FIS to record that contract. The end user
can then see the contract in the FIS portal.

The regulation for a common Norwegian FIS might follow the trend from Elhub and
require explicit and/or verifiable consent by end users, especially since this
is related to access to data. The level of trust and control will be established
by regulation.

As a starting point in the pilot register, it will be required that service
providers use *strong electronic identification and authentication* and that they
*digitally* record their agreements and consent. It will be required that the
service providers provide an *internal* identifier to their record of consent when
creating a contract on a controllable unit. The FIS will not check nor verify
the consent. This solution still relies on trust but does take the consent from
being fully implicit to somewhat explicit. It also prepares us for a future
where verifiable consent might be required by regulation.

At the time of writing, we do not see or want to pilot any specific use-cases
for data access like third party access in Elhub. When those needs arise then we
must make sure that the process of giving and getting access is smooth but safe.

### End user and contract relations

A controllable unit service provider contract is decoupled from the end user and
can span multiple end users from Elhub. This means there is no direct
relationship between the service provider contract in FIS and the end user
contract on the accounting point in Elhub. This allows for more adaptable
service arrangements, accommodating changes in end user ownership without
disrupting the service provider contract. However, end users access to the
controllable unit is given based on continuously updated end user information
from Elhub.

This raises several discussion points:

- Should there be a direct link between the end user at the metering point in
  Elhub and the service provider contract in FIS?  
    - If so, why?
- Is it likely that a service provider would enter into a contract with an end
user who is not the actual registered end user at the accounting point in Elhub?
    - If so, would it be problematic if the end user registered in Elhub is the one
    who has access to the controllable unit data in FIS, and not the one SP has an
    agreement with?
