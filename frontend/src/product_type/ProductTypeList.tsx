import { Datagrid, List } from "../components/EDS-ra/list";
import { TextField } from "../components/EDS-ra/fields";
import { zProductType } from "../generated-client/zod.gen";
import { getFields } from "../zod";

export const ProductTypeList = () => {
  const fields = getFields(zProductType.shape);

  return (
    <List perPage={25} sort={{ field: "id", order: "ASC" }}>
      <Datagrid>
        <TextField source={fields.id.source} />
        <TextField source={fields.business_id.source} />
        <TextField source={fields.name.source} />
        <TextField source={fields.service.source} />
        <TextField source={fields.products.source} />
      </Datagrid>
    </List>
  );
};
