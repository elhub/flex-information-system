# Resource synchronisation from external sources

One of the roles of the FIS is to consolidate data, but not all information is
originally created there.
Some of the data are sourced _externally_, and in this case, the FIS is only
responsible for gathering them at the same place.
Interdependencies among our resources (such as foreign key constraints) make
bulk updates impossible to run without extra care to avoid introducing too many
inconsistencies.

We currently implement this with _staging tables_ as intermediate landing points
for background synchronisation processes which regularly fetch updated data from
the external sources.
The updates are then performed _manually_ by the users, and we rely on _notices_
to alert the appropriate users to review and resolve inconsistencies.
