/**
 * System Resources (Event, Notification, Notice)
 */

import { JSX } from "react";
import { Resource } from "react-admin";
import { permissionRefs } from "../auth/permissions";
import { EventList } from "../event/EventList";
import { EventShow } from "../event/EventShow";
import { NotificationList } from "../notification/NotificationList";
import { NotificationShow } from "../notification/NotificationShow";
import { NoticeList } from "../notice/NoticeList";

export const createSystemResources = (permissions: string[]) => {
  const resources: JSX.Element[] = [];

  // Permission checks
  const canReadEvent = permissions.includes(permissionRefs.event.read);
  const canReadNotification = permissions.includes(
    permissionRefs.notification.read,
  );
  const canReadNotice = permissions.includes(permissionRefs.notice.read);

  if (canReadEvent) {
    resources.push(
      <Resource key="event" name="event" list={EventList} show={EventShow} />,
    );
  }

  if (canReadNotification) {
    resources.push(
      <Resource
        key="notification"
        name="notification"
        list={NotificationList}
        show={NotificationShow}
      />,
    );
  }

  if (canReadNotice) {
    resources.push(<Resource key="notice" name="notice" list={NoticeList} />);
  }

  return resources;
};
