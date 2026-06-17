import {
  useRecordContext,
  RecordContextProvider,
  ResourceContextProvider,
} from "ra-core";
import { BodyText, Heading, VerticalSpace } from "../components/ui";
import { DateField } from "../components/EDS-ra";
import { ProductTypeArrayField } from "../product_type/components";
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

type Notice = GNotice & {
  data: any;
};

type NoticeShowDetailsProps = {
  notice: Notice;
};

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
        <ProductTypeArrayField
          label="field.service_provider_product_suspension.product_type_ids"
          source={noticeDataFields.product_type_ids.source}
        />
      </RecordContextProvider>
    </>
  );
};

export const NoticeShowDetails = () => {
  const record = useRecordContext<Notice>();
  const noticeType = noticeTypes.find((nt) => nt.id === record?.type);

  const typeSpecificDetails = () => {
    switch (record?.type) {
      case "no.elhub.flex.party.outdated":
        return (
          <NoticePartyOutdated
            source={record.source}
            noticeData={record.data}
          />
        );
      case "no.elhub.flex.party.missing":
        return <NoticePartyMissing noticeData={record.data} />;
      case "no.elhub.flex.party.residual":
        return <NoticePartyResidual source={record.source} />;
      case "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract":
        return (
          <NoticeCUSPValidTimeOutsideContractShowDetails notice={record} />
        );
      case "no.elhub.flex.service_provider_product_suspension.product_type.not_qualified":
        return <NoticeSPPSProductTypeNotQualifiedShowDetails notice={record} />;
      default:
        return null;
    }
  };

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
      {typeSpecificDetails() ?? (
        <BodyText>No additional details on this notice.</BodyText>
      )}
    </>
  );
};
