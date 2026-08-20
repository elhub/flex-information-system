import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

const DRAFT_KEY_PREFIX = "Flex.spgpa_draft.";
const DRAFT_TTL_DAYS = 7;

export type DraftValues = {
  service_providing_group_id?: number;
  procuring_system_operator_id?: number;
  product_type_ids?: number[];
  maximum_active_power_up?: number;
  maximum_active_power_down?: number;
  ramping_capability?: string;
  ramping_description?: string;
  additional_information?: string;
  prequalified_at?: string;
  verified_at?: string;
};

export type SpgpaDraft = {
  spgId: number;
  draftId: string;
  spgName: string | undefined;
  systemOperatorName: string | undefined;
  savedAt: string;
  values: DraftValues;
};

function isExpired(savedAt: string): boolean {
  const savedDate = new Date(savedAt);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DRAFT_TTL_DAYS);
  return savedDate < cutoff;
}

// Keys are Flex.spgpa_draft.{spgId}.{draftId}
function parseKey(key: string): { spgId: number; draftId: string } | null {
  if (!key.startsWith(DRAFT_KEY_PREFIX)) return null;
  const rest = key.slice(DRAFT_KEY_PREFIX.length);
  const dotIndex = rest.indexOf(".");
  if (dotIndex === -1) return null;
  const spgId = parseInt(rest.slice(0, dotIndex), 10);
  const draftId = rest.slice(dotIndex + 1);
  if (isNaN(spgId) || !draftId) return null;
  return { spgId, draftId };
}

export function draftStorageKey(spgId: number, draftId: string): string {
  return `${DRAFT_KEY_PREFIX}${spgId}.${draftId}`;
}

function readAllDrafts(): SpgpaDraft[] {
  const drafts: SpgpaDraft[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const parsed = parseKey(key);
    if (!parsed) continue;

    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const entry = JSON.parse(raw);
      if (isExpired(entry.savedAt)) {
        localStorage.removeItem(key);
        i--;
        continue;
      }
      drafts.push({
        spgId: parsed.spgId,
        draftId: parsed.draftId,
        spgName: entry.spgName,
        systemOperatorName: entry.systemOperatorName,
        savedAt: entry.savedAt,
        values: entry.values,
      });
    } catch {
      localStorage.removeItem(key);
      i--;
    }
  }

  return drafts;
}

export function useSpgpaDrafts(): {
  drafts: SpgpaDraft[];
  deleteDraft: (spgId: number, draftId: string) => void;
} {
  const [drafts, setDrafts] = useState<SpgpaDraft[]>(readAllDrafts);
  const location = useLocation();

  // Re-read on every navigation — covers SPA navigation where the list stays
  // mounted (e.g. returning from a nested create route without unmounting).
  useEffect(() => {
    const refreshDrafts = () => setDrafts(readAllDrafts());
    queueMicrotask(refreshDrafts);
  }, [location]);

  // Re-read when the window regains focus, covering cross-tab scenarios.
  useEffect(() => {
    const handleFocus = () => setDrafts(readAllDrafts());
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const deleteDraft = useCallback((spgId: number, draftId: string) => {
    localStorage.removeItem(draftStorageKey(spgId, draftId));
    setDrafts((prev) =>
      prev.filter((d) => !(d.spgId === spgId && d.draftId === draftId)),
    );
  }, []);

  return { drafts, deleteDraft };
}
