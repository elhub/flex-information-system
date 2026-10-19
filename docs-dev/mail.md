# Mail

This document describes the mailing solution: how it works and why decisions
are made as they are.

## Why do we need email?

In FIS, the purpose of a notice is to notify market actors outside the system.
The need comes from the functional aspect of FIS: actors do not necessarily
check FIS actively, which leaves notices open for longer periods. For the PSO
this is especially important in order to handle applications.

## Who gets the email, and why?

FIS operates with notices; see [about notices here](docs-dev/notice.md). Each
notice has a receiving party, which is mainly responsible for resolving the
notice. FIS searches for all active notices. For each active notice, we check
the receiving party and identify the relevant entity, provided that the entity
has a registered, valid email address.

## Mail Content

For now, due to security purposes, the content of the email is generic,
revealing no internal information from FIS, other than that the user needs to
log in to FIS and resolve the notices. Links or other data could be abused by
malicious third parties, who could copy our format and trick the user into
clicking a malicious link.

## Mail Domain

// TODO

## Delivery guarantee

The initial implementation is optimistic and does not care whether a message
was sent successfully.

## Technical overview

[Full Size](diagrams/mail_overview.png)
|
[PlantUML description](diagrams/mail_overview.plantuml)

![Mail technical overview](diagrams/mail_overview.png)

**Note** - this functionality is disabled by default and is enabled by setting
the environment variable `MAIL_SCHEDULE_ENABLED=true`.

As of now, the solution lives in the Kotlin backend (kbackend). Kbackend has a
scheduler mechanism that triggers the email job every Monday at 06:00 PM local
Norwegian time. When the scheduler triggers, the job queries the database to
find relevant entities that have an active notice. As long as the notice is
active, the user will receive a new email each week.

Once the database query returns, kbackend receives a list of relevant email
addresses. Then, for each recipient, the email content is created. As of now,
the content is the same for every user. The `MailTemplate` is responsible for
creating and filling a templated email file. Once done, the `MailClient`
handles delivery of the email. As of now, sending emails is "fire and forget".
We also do not maintain any state of previously sent emails.

## What do we NOT do here?

We always "fire and forget" emails. Errors on the FIS side are logged. We never
wait for or verify that an email was sent successfully, nor do we keep a record
of who we have notified, when, and how often. Keeping such state might be added
later if more logic is incorporated into the mail channels. For now, it is left
out of the initial implementation for simplicity.
