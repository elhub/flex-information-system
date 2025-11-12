# Notification and notice

Many of the processes in the Flexibility Information System (FIS) trigger
notifications and notices. This section explains what they are, why we need them
and how they differ.

While notifications are a required function in the FIS and automatically inform
parties when events occur in the system, notices are a supporting feature that
helps users identify and complete the actions needed for those processes to
continue. In short, notifications keep parties informed and notices help them act.

The following sections describe each of them in more detail and explain how
they are used in the FIS.

## Notification

A notification is a resource that is used to inform a specific party that an
_event_ occured in the FIS. The purpose is to convey information to enable
parties to act according to the business processes.

An event is typically registered when a resource is created, updated or deleted
in the system. For each event, FIS will pick out specific recipents and create a
notification for them. Recipients are selected based on the rules in the
"Notifications" section of each resource.

A notification is little more than a pointer to the event and the recipient. A
example notification look like this:

```json
{
    "id":1314,
    "acknowledged":false,
    "event_id":955,
    "party_id":125,
    "recorded_by":0,
    "recorded_at":"2025-11-07T08:58:31.484929+00:00"
}
```

As you can see, it points to an event (event_id) and a party (party_id). We can
think of it as an envelope that contains information about the event and is
addressed to the party.

The acknowledged field indicates whether the party has seen the notification or
not. The party must acknowledge the notification to let FIS know that it has
been informed about the event. This is done by updating the specific
notification.

You might wonder what an event looks like. An event constains more details about
what happened, but does not contain the actual data that triggered the event.
For instance, you get to know that controllable unit X was updated, but not what
the update contained. This is also known as _thin events_. Consider this example.

```json
{
    "id":955,
    "specversion":"1.0",
    "type":"no.elhub.flex.service_providing_group_grid_suspension.delete",
    "data":null,
    "source":"/service_providing_group_grid_suspension/14",
    "time":"2025-11-07T08:58:31.480365+00:00"
}
```

As you can see, this event points to a specific resource that was deleted
(source) and the type of event that occured (type).

For information about notification as a resource in the API see [notification](../resources/notification.md).

### Example use of notification

When a procuring system operator [registers a new product type](../processes/system-operator-product-registration.md)
they intend to procure, a notification is made available for all approved service
providers through the API. Service providers retrieve this notification to receive
information about a new market opportunity. The notification enables them to
act according to the the business processes by registering a product application.
Without the notification, service providers would not have received information
about the new product type in the FIS.

![Service provider product application and qualification](../diagrams/system_operator_product_registration.png)

In this case, a notification is created, but no notice is needed since the
information does not require action from the service provider as acting on it is
optional.

## Notice

A notice is a resource that informs a party that action is required in order for
a business process to continue. Notices complement notifications by highlighting
situations where user input is needed. In this way, notices function as a task list
that helps parties complete steps required by the processes in the FIS.

Notices can be retrieved by parties in the FIS. Each notice includes information
about which party it concerns, the type of notice, and the status that triggered
it. Notices also include a direct link to the resource that led to the notice.

The notice is cleared when the required task is completed.

For information about notice as a resource in the API see [notice](../resources/notice.md).

### Example of notice

When a [controllable unit (CU) is registered in FIS](../processes/controllable-unit-registration.md)
by a service provider, the connecting system operator needs to add the grid node
to the CU and grid validate the CU. During the registration, the connecting system
operator reads two notices. One notice for the missing grid node and one ntoice for
the missing grid validation status. By completing these tasks,the registration process
can be finalized, and the service provider will have a controllable unit that is
validated.

In this case, notices are created in addition to the notification about the CU
registration because the CU status requires action from the system operator.
Acting on the information is therefore mandatory for the process to move forward.
