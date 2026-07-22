import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heading } from "../../../components/ui";
import { useSpgpaRecord } from "../show/useSpgpaShowViewModel";
import {
  useServiceProvidingGroup,
  useSpgShowViewModel,
} from "../../show/useSpgShowViewModel";
import { useTranslateEnum } from "../../../intl/intl";
import { useParty } from "../../../hooks/party";
import { useProductTypes } from "../../../product_type/useProductTypes";
import { useSpgpaComments } from "../show/useSpgpaComments";
import { displayProductType } from "../../../product_type/components";
import { SpgpaPrintSummary } from "./SpgpaPrintSummary";
import { SpgpaPrintSpgInfo } from "./SpgpaPrintSpgInfo";
import { SpgpaPrintComments } from "./SpgpaPrintComments";

export const ServiceProvidingGroupProductApplicationPrint = () => {
  const spgpaId = Number(useParams<{ id: string }>().id);
  const translateEnum = useTranslateEnum();

  // --- Fetch all data upfront ---
  const spgpaQuery = useSpgpaRecord(spgpaId);
  const spgpa = spgpaQuery.data;

  const spgQuery = useServiceProvidingGroup(spgpa?.service_providing_group_id);
  const spg = spgQuery.data;

  const spgViewModelQuery = useSpgShowViewModel(
    spgpa?.service_providing_group_id,
  );
  const spgViewModel = spgViewModelQuery.data;

  const psoQuery = useParty(spgpa?.procuring_system_operator_id);

  const productTypesQuery = useProductTypes();
  const productTypeNames = productTypesQuery.data
    ?.filter((pt) => spgpa?.product_type_ids.includes(pt.id))
    .map((pt) => displayProductType(pt))
    .join(", ");

  const commentsQuery = useSpgpaComments(spgpaId);

  // All queries must be settled before printing
  const allLoaded =
    !spgpaQuery.isPending &&
    !spgQuery.isPending &&
    !spgViewModelQuery.isPending &&
    !psoQuery.isPending &&
    !productTypesQuery.isPending &&
    !commentsQuery.commentsQuery.isPending;

  useEffect(() => {
    if (allLoaded) {
      window.print();
    }
  }, [allLoaded]);

  // --- Error handling ---
  if (spgpaQuery.error) throw spgpaQuery.error;
  if (spgQuery.error) throw spgQuery.error;
  if (spgViewModelQuery.error) throw spgViewModelQuery.error;
  if (psoQuery.error) throw psoQuery.error;
  if (commentsQuery.commentsQuery.error)
    throw commentsQuery.commentsQuery.error;

  if (!allLoaded) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Preparing print view…
      </div>
    );
  }

  if (!spgpa || !spg || !spgViewModel) return null;

  const statusLabel = translateEnum(
    `service_providing_group_product_application.status.${spgpa.status}`,
  );

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-2 border-b pb-4">
        <Heading size="xlarge">
          Product Application #{spgpa.id} for {spg.name}
        </Heading>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">Status:</span>
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Application details */}
      <section className="flex flex-col gap-2">
        <Heading size="large">Application details</Heading>
        <SpgpaPrintSummary
          spgpa={spgpa}
          spgName={spg.name}
          spgId={spg.id}
          psoName={psoQuery.data?.name}
          productTypeNames={productTypeNames}
        />
      </section>

      {/* SPG info */}
      <section className="flex flex-col gap-2">
        <Heading size="large">Service providing group info</Heading>
        <SpgpaPrintSpgInfo spg={spg} spgViewModel={spgViewModel} />
      </section>

      {/* Comments */}
      <section className="flex flex-col gap-2">
        <Heading size="large">Comments</Heading>
        <SpgpaPrintComments comments={commentsQuery.commentsQuery.data ?? []} />
      </section>
    </div>
  );
};
