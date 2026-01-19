# User creation and access control management

To illustrate the auth model (_i.e._, how entities, parties, scopes, _etc._,
interact with each other), we explain in this section how a organisation is
modelelled in the system and how access is autonomously managed by its
employees.

The following diagram shows the end result of how an example organisation and
its employees are represented in the system.

![Organisation access control management illustration](../diagrams/organisation_management.drawio.png)

The four black boxes shows how the oranisation itself is modelled in the system.

* An organisation _entity_ representing the organisation
* An organisation _party_ for administrating the organisation in the system
* Two parties with the right market roles so that the organisation can perform
  the business operations that they need in the FIS

All parties are registered as owned by the organization.

The blue and green boxes are persons. Kari is an organisation admin and can
add/remove users to the parties that the organisation owns. Ola, Diana and Tor
are regular users with varying access to read and manage data on behalf of the
two market parties.

## Autonomous access control management

One person, in this case Kari, is registered as a admin member of the
organisation party by the FIS operator. Once Kari is granted
administrator privileges on the organisation, she can add and manage access
control for her colleagues without involving the FISO.

What we refer to as _administrator privileges_ here is a certain set of scopes
on the party membership that makes the employee's person entity a member of the
organisation party.
The administrator is in charge for the addition of new users and the edition of
party memberships and entity clients.
The "administrator scopes" are therefore the ones sufficient to allow such
operations, _i.e._, the following ones:

* `manage:auth` - required for assuming/unassuming a party
* `read:data` - required for instance to access readable parties
* `use:data:entity:lookup` - to retrieve/create a technical identifier for the
  colleagues they want to add in the system
* `manage:data:party_membership` - to add/remove their colleagues from the
  organisation's parties
* `manage:data:entity_client` - to manage clients on the organisation and set up
  machine access for their colleagues

From the moment an entity is added to the organisation party with administrator
scopes, that person can log in and:

* Retrieve or create entities associated to their colleagues based on their
  person number through entity lookup.
* Add/remove these entities to/from the various parties the organisation owns in
  the system.
* Add/remove entity clients allowing applications to act as the organisation
  itself for some machine-automated operations.

The administrator can also tune the scopes for both party memberships and
entity clients, to allow for precise access control management.
For instance, they can allow a data analyst in their company to _read_ all the
data, but _not edit_ it, because such authorisations are not needed and
restricting by default reduces the risk of making a mistake.

## Sequence of actions

Let us show an example of sequence of actions in the system to perform such an
autonomous access control management. In this example, FIS operator adds Kari as
admin and Kari adds Ola as a regular user for the Energy Supplier party.

![Organisation access control management sequence](../diagrams/org_access_control_management.png)
