import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatISO, startOfDay } from "date-fns";
import { tz } from "@date-fns/tz";
import {
  useAllControllableUnitsWithMembership,
  useAddMemberships,
  useRemoveMembership,
  type CuWithMembership,
} from "./useSpgMemberships";

export type FailedCU = { cuId: number; error: unknown };

const toMidnightISO = (date: Date): string =>
  formatISO(startOfDay(date, { in: tz("Europe/Oslo") }), {
    representation: "complete",
    in: tz("Europe/Oslo"),
  });

type Props = {
  spgId: number;
  destination: string;
};

export const useAddMembersState = ({ spgId, destination }: Props) => {
  const navigate = useNavigate();

  const { data: allCUs, isLoading } =
    useAllControllableUnitsWithMembership(spgId);

  const originalMemberIds = useMemo<Set<number>>(
    () =>
      new Set(
        (allCUs ?? [])
          .filter((cu) => cu.membershipId !== undefined)
          .map((cu) => cu.id),
      ),
    [allCUs],
  );

  const [checkedIds, setCheckedIds] = useState<Set<number> | null>(null);
  const effectiveCheckedIds = checkedIds ?? originalMemberIds;

  const [searchQuery, setSearchQuery] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [validFrom, setValidFrom] = useState<Date>(
    startOfDay(new Date(), { in: tz("Europe/Oslo") }),
  );
  const [failedCUs, setFailedCUs] = useState<FailedCU[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const { mutateAsync: addMemberships } = useAddMemberships(spgId);
  const { mutateAsync: removeMembership } = useRemoveMembership(spgId);

  const toAdd = useMemo(
    () => [...effectiveCheckedIds].filter((id) => !originalMemberIds.has(id)),
    [effectiveCheckedIds, originalMemberIds],
  );

  const toRemove = useMemo(
    () => [...originalMemberIds].filter((id) => !effectiveCheckedIds.has(id)),
    [effectiveCheckedIds, originalMemberIds],
  );

  const filteredCUs = useMemo(() => {
    if (!allCUs) return [];
    const q = searchQuery.trim().toLowerCase();
    let result = allCUs;
    if (q) {
      result = result.filter(
        (cu) =>
          cu.name?.toLowerCase().includes(q) ||
          (cu.id != null && String(cu.id).includes(q)) ||
          (cu.accounting_point_business_id ?? "").toLowerCase().includes(q),
      );
    }
    if (showSelectedOnly) {
      result = result.filter((cu) => effectiveCheckedIds.has(cu.id));
    }
    return result;
  }, [allCUs, searchQuery, showSelectedOnly, effectiveCheckedIds]);

  const totalFlexibleCapacity = useMemo(
    () =>
      (allCUs ?? [])
        .filter((cu) => effectiveCheckedIds.has(cu.id))
        .reduce((sum, cu) => sum + (cu.maximum_active_power ?? 0), 0),
    [allCUs, effectiveCheckedIds],
  );

  const allFilteredSelected =
    filteredCUs.length > 0 &&
    filteredCUs.every((cu) => effectiveCheckedIds.has(cu.id));

  const cuById = useMemo(
    () => new Map((allCUs ?? []).map((cu) => [cu.id, cu])),
    [allCUs],
  );

  const toAddCUs = toAdd
    .map((id) => cuById.get(id))
    .filter(Boolean) as CuWithMembership[];

  const toRemoveCUs = toRemove
    .map((id) => cuById.get(id))
    .filter(Boolean) as CuWithMembership[];

  const toggleCu = (cuId: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev ?? originalMemberIds);
      if (next.has(cuId)) {
        next.delete(cuId);
      } else {
        next.add(cuId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setCheckedIds((prev) => {
      const next = new Set(prev ?? originalMemberIds);
      if (allFilteredSelected) {
        filteredCUs.forEach((cu) => next.delete(cu.id));
      } else {
        filteredCUs.forEach((cu) => next.add(cu.id));
      }
      return next;
    });
  };

  const handleApplyChanges = async (validFromDate: Date) => {
    setIsApplying(true);
    const errors: FailedCU[] = [];

    if (toAdd.length > 0) {
      const result = await addMemberships({
        cuIds: toAdd,
        validFrom: toMidnightISO(validFromDate),
      });
      result.failed.forEach((f) => errors.push(f));
    }

    await Promise.allSettled(
      toRemove.map((id) => {
        const cu = cuById.get(id);
        if (cu?.membershipId !== undefined) {
          return removeMembership(cu.membershipId).catch((error: unknown) => {
            errors.push({ cuId: id, error });
          });
        }
      }),
    );

    setIsApplying(false);
    setFailedCUs(errors);

    if (errors.length === 0) {
      navigate(destination);
    } else {
      setDatePickerOpen(false);
    }
  };

  const handleNext = () => {
    if (toAdd.length > 0) {
      setDatePickerOpen(true);
    } else if (toRemove.length > 0) {
      void handleApplyChanges(validFrom);
    } else {
      navigate(destination);
    }
  };

  return {
    isLoading,
    filteredCUs,
    toAddCUs,
    toRemoveCUs,
    effectiveCheckedIds,
    setCheckedIds,
    searchQuery,
    setSearchQuery,
    showSelectedOnly,
    setShowSelectedOnly,
    reviewOpen,
    setReviewOpen,
    datePickerOpen,
    setDatePickerOpen,
    validFrom,
    setValidFrom,
    failedCUs,
    isApplying,
    toAdd,
    toRemove,
    totalFlexibleCapacity,
    allFilteredSelected,
    toggleCu,
    toggleSelectAll,
    handleApplyChanges,
    handleNext,
  };
};
