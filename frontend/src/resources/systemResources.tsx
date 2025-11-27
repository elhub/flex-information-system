/**
 * System Resources (Event, Notification, Notice)
 */

import { JSX } from "react";
import { Resource } from "react-admin";
import { EventList } from "../event/EventList";
import { EventShow } from "../event/EventShow";
import { NotificationList } from "../notification/NotificationList";
import { NotificationShow } from "../notification/NotificationShow";
import { NoticeList } from "../notice/NoticeList";

export const createSystemResources = (permissions: string[]) => {
  const resources: JSX.Element[] = [];

  if (permissions.includes("event.read")) {
    resources.push(
      <Resource key="event" name="event" list={EventList} show={EventShow} />,
    );
  }

  if (permissions.includes("notification.read")) {
    resources.push(
      <Resource
        key="notification"
        name="notification"
        list={NotificationList}
        show={NotificationShow}
      />,
    );
  }

  if (permissions.includes("notice.read")) {
    resources.push(<Resource key="notice" name="notice" list={NoticeList} />);
  }

  return resources;
};
