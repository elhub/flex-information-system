import { DataProvider } from "ra-core";
import postgrestRestProvider, {
  IDataProviderConfig,
  defaultPrimaryKeys,
  defaultSchema,
} from "@raphiniert/ra-data-postgrest";
import { apiURL, httpClient } from "./httpConfig";
import { prepareControllableUnitFilter } from "./controllable_unit/controllableUnitFilter";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Date);

const isLogicalOperator = (key: string) =>
  ["or", "and"].includes(key.split("@")[0]);

// WORKAROUND for react-admin / ra-data-postgrest.
// Filter inputs with dotted sources (e.g. "accounting_point.business_id@ilike")
// end up as nested objects in the list filter, because react-admin's filter
// form treats dots as nested paths. ra-data-postgrest (parseFilters) only
// follows the first key of each nested object, so sibling filters, such as
// several filters on accounting_point, are silently dropped. We flatten them
// back to dotted keys, which it handles correctly.
// Keys for logical operators ("or", "and") are kept nested, as the provider
// expects them that way.
// This can be removed if ra-data-postgrest handles nested filters properly.
export const flattenFilter = (
  filter: Record<string, unknown>,
  prefix = "",
): Record<string, unknown> =>
  Object.entries(filter).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (isPlainObject(value) && !isLogicalOperator(key)) {
        Object.assign(acc, flattenFilter(value, `${prefix}${key}.`));
      } else {
        acc[`${prefix}${key}`] = value;
      }
      return acc;
    },
    {},
  );

// resource-specific adjustments applied to the (flattened) list filter
const filterPreparers: Record<
  string,
  (filter: Record<string, unknown>) => Record<string, unknown>
> = {
  controllable_unit: prepareControllableUnitFilter,
};

const config: IDataProviderConfig = {
  apiUrl: apiURL,
  httpClient: httpClient,
  defaultListOp: "eq",
  primaryKeys: defaultPrimaryKeys,
  schema: defaultSchema,
};

const postgrestDataProvider = postgrestRestProvider(config);

// Some API resources that are not backed by a DB table have no IDs in their
// rows. For such cases to work properly, the getList must be overriden so that
// we add a dummy ID there and satisfy internal React Admin typing constraints.
// cf https://github.com/marmelab/react-admin/blob/27dccfb8519de551ef7e236355860aacef36ef56/packages/ra-core/src/types.ts#L12-L15
export const dataProvider: DataProvider = {
  ...postgrestDataProvider,
  getList: (resource, params) => {
    const flatFilter = flattenFilter(params.filter ?? {});
    const filter = filterPreparers[resource]?.(flatFilter) ?? flatFilter;
    return postgrestDataProvider
      .getList(resource, { ...params, filter })
      .then((response) => {
        const newData = response.data.map((record, i) =>
          record?.id ? record : { ...record, id: i },
        );
        return { ...response, data: newData };
      });
  },
};
