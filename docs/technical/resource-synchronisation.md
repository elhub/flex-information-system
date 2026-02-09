# Resource synchronisation from external sources

One of the roles of the FIS is to consolidate data, but not all information is
originally created there.
Some of the data are sourced _externally_, and in this case, the FIS is only
responsible for gathering them at the same place.
Interdependencies among our resources (such as foreign key constraints) make
bulk updates impossible to run without extra care to avoid introducing too many
inconsistencies.

## Nature of the required updates

The implementation of such an update mechanism depends on the nature of the
required updates, _i.e._, whether the data provided by the external source
changes very frequently or just once in a while, and whether the amount of
data is light or very heavy.

In the case of the FIS, we need to keep track of data from the following
external sources:

* market parties: a few hundred records, to be updated once in a while
* balance responsibility information per metering grid area: approximately 100k
  records, to be updated every few days at least

All of these data sources receive relatively small updates on a daily basis.

## Architecture pattern

Resource synchronisation processes all follow the architecture illustrated in
the diagram below:

![Resource synchronisation architecture diagram](../diagrams/resource_sync.drawio.png)

On the left-hand side lies the _internal data source table_, which is the target
of the synchronisation process.
It is the table whose data will be used by the rest of the database as a trusted
source of information.

The key component of the pattern we implement here is the _landing table_,
representing a kind of intermediary step, splitting the data fetching and the
data update phases.
Data will first be loaded into the landing table, then an _update procedure_
will be followed to actually update the target table.
The landing table is a copy of the target table without the foreign key
constraints to allow storing "raw" data.
It is the update procedure's responsibility to ignore/fix/warn about wrong
records coming from the landing table.
The landing table still contains some format checks to ensure more data quality,
even though we trust the external source to some extent.

The last component is the _data fetching module_, lying outside of the database.
It is responsible for downloading the data via the API of the
_external data source_.
This module loads data into the landing table via an _interface_ (API or
views/procedures), so as to ensure decoupling and prevent assuming an internal
database structure from the outside, which makes us free to change the internal
details over time if needed.

## Update mechanism

The actual update mechanism depends on the data and it can be automated or
manual.
For instance, party synchronisation is done manually by the appropriate users,
after they have received _notices_ about the inconsistency or out-of-sync state
to review and resolve, whereas balance responsibility is to be loaded
automatically every day by a background process.
