import {
  RecordContextProvider,
  ResourceContextProvider,
  useRecordContext,
} from "ra-core";
import { FunctionField } from "react-admin";
import { BodyText, Heading, VerticalSpace } from "../components/ui";
import { DateField } from "../components/EDS-ra";
import { ProductTypeArrayField } from "../components/ProductTypeArrayField";
import { Notice as GNotice } from "../generated-client";
import {
  zControllableUnitServiceProvider,
  zNoticeDataProductTypeNotQualified,
} from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { DataTable } from "../components/EDS-ra/list/Datagrid";
import { NoticePartyMissing } from "./details/NoticePartyMissing";
import { NoticePartyOutdated } from "./details/NoticePartyOutdated";
import { NoticePartyResidual } from "./details/NoticePartyResidual";
import noticeTypes from "./noticeTypes";
import type { ReactNode } from "react";
import { NoticeActionButton } from "./details/NoticeActionButton";

type Notice = GNotice & {
  data: any;
};

type NoticeShowDetailsProps = {
  notice: Notice;
};

type NoticeDetailsRenderer = (notice: Notice) => ReactNode;

// component to show details of a notice of type
// no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract
const NoticeCUSPValidTimeOutsideContractShowDetails = ({
  notice,
}: NoticeShowDetailsProps) => {
  const cuspFields = getFields(zControllableUnitServiceProvider.shape);
  return (
    <>
      <Heading level={3} size="xsmall" spacing>
        Inconsistency: Controllable unit service provider / Accounting point end
        user.
      </Heading>
      <VerticalSpace />
      <BodyText>
        The following time intervals are the valid time sections of the
        Controllable Unit Service Provider relation where the end user given in
        the contract is not the one behind the accounting point:
      </BodyText>
      <VerticalSpace />
      <ResourceContextProvider value="controllable_unit_service_provider">
        <DataTable
          rowClick={false}
          data={notice.data.invalid_timeline.map(
            (item: object, index: number) => ({
              ...item,
              id: index,
            }),
          )}
        >
          <DateField source={cuspFields.valid_from.source} />
          <DateField source={cuspFields.valid_to.source} />
        </DataTable>
      </ResourceContextProvider>
    </>
  );
};

// component to show details of a notice of type
// no.elhub.flex.service_provider_product_suspension.product_type.not_qualified
const NoticeSPPSProductTypeNotQualifiedShowDetails = ({
  notice,
}: NoticeShowDetailsProps) => {
  const noticeDataFields = getFields(zNoticeDataProductTypeNotQualified.shape);

  return (
    <>
      <Heading level={3} size="xsmall" spacing>
        The following product types are not qualified for the service provider:
      </Heading>
      <VerticalSpace />
      <RecordContextProvider value={notice.data}>
        <FunctionField
          label="field.service_provider_product_suspension.product_type_ids"
          source={noticeDataFields.product_type_ids.source}
          render={(record) => (
            <ProductTypeArrayField productTypeIds={record.product_type_ids} />
          )}
        />
      </RecordContextProvider>
    </>
  );
};

const noticeDetailsRenderers: Record<string, NoticeDetailsRenderer> = {
  "no.elhub.flex.party.outdated": (notice) => (
    <NoticePartyOutdated source={notice.source} noticeData={notice.data} />
  ),
  "no.elhub.flex.party.missing": (notice) => (
    <NoticePartyMissing noticeData={notice.data} />
  ),
  "no.elhub.flex.party.residual": (notice) => (
    <NoticePartyResidual source={notice.source} />
  ),
  "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract":
    (notice) => (
      <NoticeCUSPValidTimeOutsideContractShowDetails notice={notice} />
    ),
  "no.elhub.flex.service_provider_product_suspension.product_type.not_qualified":
    (notice) => (
      <NoticeSPPSProductTypeNotQualifiedShowDetails notice={notice} />
    ),
  "no.elhub.flex.accounting_point_grid_location.source_insufficient": (
    notice,
  ) => (
    <NoticeActionButton
      notice={notice}
      buttonTextKey={"text.notice_insufficient_grid_location_source_button"}
    />
  ),
  "no.elhub.flex.accounting_point_grid_location.missing": (notice) => (
    <NoticeActionButton
      notice={notice}
      buttonTextKey={"text.notice_missing_grid_location_button"}
    />
  ),
  "no.elhub.flex.service_providing_group_membership.bidding_zone_mismatch": (
    notice,
  ) => {
    <NoticeActionButton
      notice={notice}
      buttonTextKey={"text.notice_bidding_zone_mismatch"}
    />;
  },
};

export const NoticeShowDetails = () => {
  const record = useRecordContext<Notice>();
  const noticeType = noticeTypes.find((nt) => nt.id === record?.type);
  const typeSpecificDetails = record
    ? noticeDetailsRenderers[record.type]?.(record)
    : null;

  return (
    <>
      {noticeType?.description && (
        <>
          <Heading level={3} size="xsmall" spacing>
            Description
          </Heading>
          <BodyText>{noticeType.description}</BodyText>
          <VerticalSpace />
        </>
      )}
      {noticeType?.action && (
        <>
          <Heading level={3} size="xsmall" spacing>
            Action
          </Heading>
          <BodyText>{noticeType.action}</BodyText>
          <VerticalSpace />
        </>
      )}
      {typeSpecificDetails ?? (
        <BodyText>No additional details on this notice.</BodyText>
      )}
    </>
  );
};
