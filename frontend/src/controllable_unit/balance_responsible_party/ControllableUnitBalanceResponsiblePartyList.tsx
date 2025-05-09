import {
  List,
  ReferenceField,
  ResourceContextProvider,
  SortPayload,
  TextField,
  useGetList,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { Datagrid } from "../../auth";
import { DateField } from "../../datetime";
import { CircularProgress } from "@mui/material";

export const ControllableUnitBalanceResponsiblePartyList = () => {
  // accounting point id of the controllable unit whose BRPs we want to get
  const { accounting_point_id } = useRecordContext()!;
  const { permissions } = usePermissions();

  // get accounting point technical ID of the controllable unit
  const { data: apData, isPending } = useGetList("accounting_point", {
    filter: { business_id: accounting_point_id },
  });

  // this allows querying the AP-BRP resource
  const sort: SortPayload = { field: "valid_from", order: "ASC" };
  const { data, isLoading } = useGetList(
    "accounting_point_balance_responsible_party",
    {
      filter: { accounting_point_id: apData ? apData[0].id : 0 },
      sort,
    },
  );

  if (isPending) {
    return <CircularProgress size={25} thickness={2} />;
  }

  return (
    permissions.includes("accounting_point_balance_responsible_party.read") && (
      <ResourceContextProvider value="accounting_point_balance_responsible_party">
        <List title={false} perPage={10} exporter={false} empty={false}>
          <Datagrid
            bulkActionButtons={false}
            data={data}
            isLoading={isLoading}
            sort={sort}
          >
            <TextField source="id" label="ID" />
            <ReferenceField
              source="balance_responsible_party_id"
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField source="energy_direction" />
            <DateField source="valid_from" showTime />
            <DateField source="valid_to" showTime />
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
