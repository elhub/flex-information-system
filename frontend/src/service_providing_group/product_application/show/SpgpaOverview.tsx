import { Link as RouterLink } from "react-router-dom";
import { LabelValue } from "../../../components/LabelValue";
import { Heading, Link, Panel } from "../../../components/ui";
import {
  ServiceProvidingGroup,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { useParty } from "../../../hooks/party";
import { toDateTimeString } from "../../../util";

export const SpgpaOverview = ({
  spgpa,
  spg,
}: {
  spgpa: ServiceProvidingGroupProductApplication;
  spg: ServiceProvidingGroup | undefined;
}) => {
  const procuringServiceProvider = useParty(spgpa.procuring_system_operator_id);

  if (procuringServiceProvider.error) throw procuringServiceProvider.error;

  return (
    <div className="flex flex-col gap-4">
      <Panel border className="p-4 sm:p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <LabelValue
            label="Service providing group"
            value={
              spg ? (
                <Link
                  as={RouterLink}
                  to={`/service_providing_group/${spgpa.service_providing_group_id}/show`}
                >
                  {spg.name} (#{spg.id})
                </Link>
              ) : undefined
            }
          />
          <LabelValue
            label="System operator / PSO"
            value={
              <Link
                as={RouterLink}
                to={`/party/${spgpa.procuring_system_operator_id}/show`}
              >
                {procuringServiceProvider.data?.name}
              </Link>
            }
          />
        </div>
      </Panel>

      {(spgpa.ramping_description || spgpa.additional_information) && (
        <Panel border className="flex flex-col gap-5 p-4 sm:p-5">
          <Heading size="small">Application details</Heading>
          {spgpa.ramping_description && (
            <LabelValue
              labelKey="service_providing_group_product_application.ramping_description"
              value={
                <span className="whitespace-pre-wrap">
                  {spgpa.ramping_description}
                </span>
              }
            />
          )}
          {spgpa.additional_information && (
            <LabelValue
              label="Additional information"
              value={
                <span className="whitespace-pre-wrap">
                  {spgpa.additional_information}
                </span>
              }
            />
          )}
        </Panel>
      )}

      <Panel border className="flex flex-col gap-5 p-4 sm:p-5">
        <Heading size="small">Application timeline</Heading>
        <div className="grid gap-5 sm:grid-cols-2">
          <LabelValue
            label="Created at"
            value={toDateTimeString(spgpa.created_at)}
          />
          {spgpa.prequalified_at && (
            <LabelValue
              label="Prequalified at"
              value={toDateTimeString(spgpa.prequalified_at)}
            />
          )}
          {spgpa.verified_at && (
            <LabelValue
              label="Verified at"
              value={toDateTimeString(spgpa.verified_at)}
            />
          )}
          {spgpa.complete_at && (
            <LabelValue
              label="Complete at"
              value={toDateTimeString(spgpa.complete_at)}
            />
          )}
        </div>
      </Panel>
    </div>
  );
};
