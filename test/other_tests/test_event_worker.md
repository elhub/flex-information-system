# Event worker tests

For now, we do not have automated testing for the event worker, but here is a
short list of some manual tests that can be carried out to check everything is
working as intended.

Our aim is _exactly once delivery_, so the two things we must check is that all
events are processed, and no notification is created twice.

## No event is lost

1. Get authenticated.
2. Stop the backend.
3. Make changes in the database.
4. Restart the backend.

Check that after step 4, all the changes made in step 3 actually lead to the
expected notifications being created. This makes sure that a failure in the
event worker does not lose messages, and that there is a working acknowledgement
mechanism.

---

Thanks to the transactional outbox pattern, if something happens in the database
before the event is created, the whole transaction will be cancelled, so we do
not need any test trying to shut down the database at specific moments before
communication with the event worker in theory.

## No double notification

1. Launch the system normally.
2. Make changes in the database.
3. Shut down the backend before it sends an acknowledgement to the server.
4. Restart the backend.

In the protocol, the event worker does not acknowledge _every_ message it gets,
but instead gives the current acknowledged LSN when it is asked by the server.
This means that if the worker creates notifications and is shut down before the
acknowledgement, on restart the server won't know these notifications have been
created, and the worker will be given the same messages another time. This test
is there to make sure that an acknowledgement is not assumed before it is
actually sent by the worker _and_ that processing the same message twice does
not lead to an error in the worker or a double notification in the database.
