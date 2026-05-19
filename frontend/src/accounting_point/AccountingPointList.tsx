import { ExportButton } from "react-admin";
import { Datagrid, List } from "../components/EDS-ra/list";
import { TextField } from "../components/EDS-ra/fields";
import { AutocompleteReferenceInput } from "../components/EDS-ra/inputs";
import { zAccountingPoint } from "../generated-client/zod.gen";
import { getFields } from "../zod";

export const AccountingPointList = () => {
  const fields = getFields(zAccountingPoint.shape);

  const filters = [
    <AutocompleteReferenceInput
      key="id"
      source="id@eq"
      reference="accounting_point"
      fieldName="business_id"
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={filters}
      actions={[<ExportButton key="export" />]}
    >
      <Datagrid>
        <TextField source={fields.id.source} />
        <TextField source={fields.business_id.source} />
      </Datagrid>
    </List>
  );
};
