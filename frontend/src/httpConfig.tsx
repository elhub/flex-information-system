import { fetchUtils } from "react-admin";

export const serverURL =
  window.env.VITE_FLEX_URL ?? import.meta.env.VITE_FLEX_URL;
export const apiURL = serverURL + "/api/v0";
export const authURL = serverURL + "/auth/v0";
export const docsURL = "https://elhub.github.io/flex-information-system";

export async function httpClient(url: string, options: any = {}) {
  // --- workaround for array filter in the URL query --------------------------

  // Suppose we want to filter a list in the UI, keeping only rows where the
  // value of a field belongs to a fixed list of possible values.
  // For example, let's say we want to keep only rows where field `a` has value
  // `1` or `2`.

  // We will use a React-Admin array input component for this, such as a
  // SelectArrayInput (https://marmelab.com/react-admin/SelectArrayInput.html).
  // If we tick boxes or select values corresponding to `1` and `2`, the input
  // component will store `1,2` in the form state.

  // When the form is turned into a network call to actually apply the filter,
  // React-Admin will generate a URL query that looks like `?a=eq.1,2`.
  // As we use PostgREST, we can add `@in` to the `source` property, i.e.,
  // `a@in`, so the URL query becomes `&a=in.1,2` and performs a "contains"
  // query instead of just an equality check that would fail here.
  // Unfortunately, this is not sufficient because PostgREST's "contains" query
  // syntax uses parentheses. It should look like `?a=in.(1,2)`.

  // This wrong URL translation comes from a bug in the data provider:
  // https://github.com/raphiniert-com/ra-data-postgrest/issues/173

  // It is not possible to edit the input component to change the format of the
  // stored form state, because having any other format than the comma-separated
  // list basically breaks the UI component.

  // The solution we use here is to intercept the network call and change the
  // URL before it is sent. We find an occurrence of `=in.` meaning that we
  // are doing this kind of "contains" query, and we add the parentheses around
  // the values.
  const u = new URL(url);

  u.searchParams.forEach((value, key) => {
    if (value.startsWith("in") && !value.startsWith("in.(")) {
      u.searchParams.set(key, value.replace("in.", "in.(") + ")");
    }
  });

  // --- workaround for single-ID update/delete in PostgREST -------------------

  // In PostgREST, updates and deletes are done on the same endpoint as the
  // one used to fetch the list of items, just with an ID filter.
  // In our API, we do not allow PATCH and DELETE requests on the list endpoint.
  // Instead, we use single-ID endpoints. We just have to rewrite the URL to
  // match this.

  if (options.method == "PATCH" || options.method == "DELETE") {
    u.href = u.href.replace(/\?id=eq.(\d+)$/, "/$1");
  }

  // ---

  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }
  return fetchUtils.fetchJson(u.href, options);
}
