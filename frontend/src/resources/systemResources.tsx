/**
 * System Resources (Event, Notification, Notice)
 */

import { JSX } from "react";
import { Resource } from "react-admin";
import { Permissions } from "../auth/permissions";
import { EventList } from "../event/EventList";
import { EventShow } from "../event/EventShow";
import { NotificationList } from "../notification/NotificationList";
import { NotificationShow } from "../notification/NotificationShow";
import { NoticeList } from "../notice/NoticeList";
import { NoticeShow } from "../notice/NoticeShow";

export const createSystemResources = (permissions: Permissions) => {
  const resources: JSX.Element[] = [];

  // Permission checks
  const canReadEvent = permissions.allow("event", "read");
  const canReadNotification = permissions.allow("notification", "read");
  const canReadNotice = permissions.allow("notice", "read");

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
    resources.push(
      <Resource
        key="notice"
        name="notice"
        list={NoticeList}
        show={NoticeShow}
      />,
    );
  }

  return resources;
};
