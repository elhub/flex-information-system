import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Dropdown, Loader } from "../../../components/ui";
import { Link as RouterLink } from "react-router-dom";
import { ShowPageResourceLayout } from "../../../components/ShowPageResourceLayout";
import { useGetIdentity, usePermissions, UserIdentity } from "ra-core";
import { Permissions } from "../../../auth/permissions";
import { SpgpaShowSummary } from "./SpgpaShowSummary";
import { SpgpaShowTabs } from "./SpgpaShowTabs";
import { SpgpaActionBar } from "./SpgpaActionBar";
import { useSpgpaRecord } from "./useSpgpaShowViewModel";
import { useServiceProvidingGroup } from "../../show/useSpgShowViewModel";
import { SpgpaAlerts } from "./SpgpaAlerts";
import { SpgpaStatusBadge } from "../../../components/SpgpaStatusBadge";
import { ScaleToggle } from "../../../components/ScaleToggle";
import { KILO, MEGA, Scale } from "../../../utils/scales";
import { IconDots, IconExternal, IconPencil } from "@elhub/ds-icons";

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
      resourceType={`Product application #${spgpa.id}`}
      resourceName={spg.data ? spg.data.name : "Product application"}
      status={<SpgpaStatusBadge status={spgpa.status} />}
      alerts={<SpgpaAlerts spgpa={spgpa} />}
      viewControls={
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Display unit:</span>
          <ScaleToggle
            unit="W"
            options={POWER_SCALE_OPTIONS}
            value={powerScale}
            onChange={setPowerScale}
          />
        </div>
      }
      utilityActions={
        <Dropdown>
          <Button
            as={Dropdown.Toggle}
            variant="tertiary"
            icon={IconDots}
            aria-label="More actions"
            title="More actions"
          />
          <Dropdown.Menu arrow placement="bottom-start">
            <Dropdown.Menu.GroupedList>
              {canEdit && (
                <Dropdown.Menu.GroupedList.Item
                  as={RouterLink}
                  to={`/service_providing_group/${spgpa.service_providing_group_id}/product_application/${spgpa.id}`}
                >
                  <div className="flex items-center gap-2">
                    <IconPencil />
                    Edit
                  </div>
                </Dropdown.Menu.GroupedList.Item>
              )}
              <Dropdown.Menu.GroupedList.Item
                as={RouterLink}
                to={`/service_providing_group_product_application/${spgpa.id}/print`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-2">
                  <IconExternal />
                  Print
                </div>
              </Dropdown.Menu.GroupedList.Item>
            </Dropdown.Menu.GroupedList>
            {canReadEvents && (
              <>
                <Dropdown.Menu.Divider />
                <Dropdown.Menu.GroupedList>
                  <Dropdown.Menu.GroupedList.Item
                    as={RouterLink}
                    to={`/event?filter=${eventsFilter}`}
                  >
                    Events
                  </Dropdown.Menu.GroupedList.Item>
                </Dropdown.Menu.GroupedList>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      }
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
