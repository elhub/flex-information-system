import { List, TextField, ExportButton, TopToolbar } from "react-admin";
import { AutocompleteReferenceInput, Datagrid } from "../auth";

const ListActions = () => {
  return (
    <TopToolbar>
      <ExportButton />
    </TopToolbar>
  );
};

export const AccountingPointList = () => {
  const filters = [
    <AutocompleteReferenceInput
      key="id"
      source="id@eq"
      reference="accounting_point"
      label="field.controllable_unit.accounting_point_id"
      fieldName="business_id"
      alwaysOn
    />,
  ];

  return (
    <List
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      filters={filters}
      actions={<ListActions />}
    >
      <Datagrid>
        <TextField source="id" label="field.accounting_point.id" />
        <TextField
          source="business_id"
          label="field.accounting_point.business_id"
        />
      </Datagrid>
    </List>
  );
};
