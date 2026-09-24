import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "../../../components/ui";
import { ShowPageResourceLayout } from "../../../components/ShowPageResourceLayout";
import { useGetIdentity, usePermissions, UserIdentity } from "ra-core";
import { Permissions } from "../../../auth/permissions";
import { SpgpaShowSummary } from "./SpgpaShowSummary";
import { SpgpaShowTabs } from "./SpgpaShowTabs";
import { SpgpaActionBar } from "./SpgpaActionBar";
import { useSpgpaRecord } from "./useSpgpaShowViewModel";
import { useServiceProvidingGroup } from "../../show/useSpgShowViewModel";
import { useSpgpaAlerts } from "./SpgpaAlerts";
import { SpgpaStatusBadge } from "../../../components/SpgpaStatusBadge";
import { ScaleToggle } from "../../../components/ScaleToggle";
import { KILO, MEGA, Scale } from "../../../utils/scales";
import { IconExternal, IconPencil } from "@elhub/ds-icons";

const POWER_SCALE_OPTIONS: Scale[] = [KILO, MEGA];

const userCanUpdateStatus = (identity: UserIdentity | undefined) =>
  identity?.role === "flex_flexibility_information_system_operator" ||
  identity?.role === "flex_system_operator";

export const ServiceProvidingGroupProductApplicationShow = () => {
  const spgpaId = Number(useParams<{ id: string }>().id);
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();

  const [powerScale, setPowerScale] = useState<Scale>(KILO);

  const { data: spgpa, isPending, error } = useSpgpaRecord(spgpaId);
  const spg = useServiceProvidingGroup(spgpa?.service_providing_group_id);
  const alert = useSpgpaAlerts(spgpa);

  const canUpdateStatus =
    !!permissions?.allow(
      "service_providing_group_product_application.status",
      "update",
    ) && userCanUpdateStatus(identity);
  const canEdit = permissions?.allow(
    "service_providing_group_product_application",
    "update",
  );
  const canReadEvents = permissions?.allow("event", "read");

  if (isPending) return <Loader />;
  if (error) throw error;
  if (!spgpa) return null;
  if (spg.error) throw spg.error;

  const eventsFilter = encodeURIComponent(
    JSON.stringify({
      "subject@eq": `/service_providing_group_product_application/${spgpa.id}`,
    }),
  );

  return (
    <ShowPageResourceLayout
      secondaryHeaderText={`Service providing group product application #${spgpa.id}`}
      mainHeaderText={spg.data ? spg.data.name : "Product application"}
      status={<SpgpaStatusBadge status={spgpa.status} />}
      alerts={alert ?? undefined}
      viewControls={
        <ScaleToggle
          unit="W"
          options={POWER_SCALE_OPTIONS}
          value={powerScale}
          onChange={setPowerScale}
        />
      }
      utilityActions={[
        {
          label: "Actions",
          actions: [
            {
              to: `/service_providing_group/${spgpa.service_providing_group_id}/product_application/${spgpa.id}`,
              title: "Edit",
              icon: <IconPencil />,
              shouldShow: canEdit,
            },
            {
              to: `/service_providing_group_product_application/${spgpa.id}/print`,
              title: "Print",
              icon: <IconExternal />,
              external: true,
            },
          ],
        },
        {
          label: "Navigate to",
          actions: [
            {
              to: `/event?filter=${eventsFilter}`,
              title: "Events",
              shouldShow: canReadEvents,
            },
          ],
        },
      ]}
      workflowActions={
        canUpdateStatus ? <SpgpaActionBar spgpa={spgpa} /> : undefined
      }
      summary={
        <SpgpaShowSummary
          spgpa={spgpa}
          spg={spg.data}
          powerScale={powerScale}
        />
      }
      content={
        <SpgpaShowTabs
          spgId={spgpa.service_providing_group_id}
          spgpaId={spgpa.id}
          spgpa={spgpa}
          spg={spg.data}
          powerScale={powerScale}
        />
      }
    />
  );
};
