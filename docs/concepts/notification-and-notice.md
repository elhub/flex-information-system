# Notification and notice

Notifications and notices are sent to relevant parties when something is created,
updated or deleted (or expired?). Notifications and notices convey infomation to
parties about changes and required action in the Flexibility Information System
(FIS). They are sent in FIS to the relevant parties.

## Notification

Notifications are messages that inform parties when something is
created, updated or deleted in FIS. The notifications are sent to parties, not individuals.
The purpose of notifications is to convey information to enable parties to act according
to the business processes.

Notifications include the event type, event source and the time of the event that
occured. Notifications also include a direct link to the update that caused
the notification.

The notification is cleared when the notification is aknowledged. Aknowledgement
lets FIS know that it has fulfilled its obligation to inform the party about the
change.

### Example of notification

When a procuring system operator [registers a new product type](../processes/system-operator-product-registration.md)
they intend to procure, a notification is sent to all approved service providers.
The reason why service providers receive the notification is so that they receive
information about a new market opportunity. The notification thus enables them to
act according to the the business processes by registering a product application.
Without the notification, the service providers would not have received information
about the new product type in FIS.

![Service provider product application and qualification](../diagrams/system_operator_product_registration.png)

The reason why they receive a notification instead of a notice is because the
information does not require action from the service provider. Acting upon the received
information in the notification is optional.

## Notice

Notices are messages that are sent to relevant parties that require action
from the recipitent. Notice works as a task list for the recipient. The
purpose of notices is to inform parties about the actions that are required
from them in order for the business processes to continue.

The notices include which party the notice is for, which type of notice it is
and the source of the notice. Notices also include a direct link to the update
that led to the notice.

The notice is cleared when the required task is completed.

### Example of notice

When a controllable unit (CU) is registered in FIS by a service provider, the connecting
system operator needs to add the grid node to the CU and grid validate the CU. When
a CU is registered and set to active in FIS, the connecting system operators receives
two notices, one for the missing grid node and one for the missing grid validation
status. By doing these tasks, the business processes can continue as the service
provider will have a controllable unit that is validated.

The reason why the system operator receives a notice and not a notification
is because the situation requires action from the system operator. Acting upon the
received information is mandatory (?).

Diagram with notification and notice at the same time to illustrate the
difference?