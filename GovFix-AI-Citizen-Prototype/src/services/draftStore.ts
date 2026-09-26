export interface PortalDraft {
  portalUrl: string;
  serviceId?: string;
  payload: Record<string, unknown>;
  note: string;
  updatedAt: string;
}

const DRAFT_STORAGE_KEY = "govfix_active_portal_draft";

export function getPortalDraft(): PortalDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as PortalDraft;
    if (!draft || typeof draft !== "object" || typeof draft.updatedAt !== "string") return null;
    return draft;
  } catch {
    return null;
  }
}

export function savePortalDraft(
  draft: Omit<PortalDraft, "updatedAt"> | PortalDraft
): PortalDraft {
  const savedDraft: PortalDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(savedDraft));
    } catch (error) {
      console.warn("[GovFix-Drafts] Could not persist portal draft.", error);
    }
  }

  return savedDraft;
}

export function clearPortalDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}
