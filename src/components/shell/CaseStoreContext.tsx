"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { Case, CaseStatus, cases as seedCases, TimelineEvent } from "@/lib/mock-data";

export interface AddCaseInput {
  business: string;
  campaignId: string;
  invitationId: string;
  segment?: string;
  adcbReference?: string;
}

interface CaseStoreValue {
  listCases: () => Case[];
  getCase: (id: string) => Case | undefined;
  markReadyForHandoff: (id: string) => void;
  requestInformation: (id: string, note: string) => void;
  requestCorrection: (id: string, field: string, note: string) => void;
  resolveOpenItems: (id: string) => void;
  addCase: (input: AddCaseInput) => string;
  logEvent: (id: string, event: TimelineEvent, statusUpdate?: CaseStatus) => void;
}

const CaseStoreContext = createContext<CaseStoreValue | null>(null);

function nowLabel() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function withTimeline(c: Case, event: TimelineEvent): Case {
  return { ...c, timeline: [...c.timeline, event] };
}

export function CaseStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Record<string, Case>>(() =>
    Object.fromEntries(seedCases.map((c) => [c.id, c]))
  );

  const markReadyForHandoff = useCallback((id: string) => {
    setStore((prev) => {
      const c = prev[id];
      if (!c) return prev;
      const updated = withTimeline({ ...c, status: "ready_for_handoff" as CaseStatus }, {
        label: "Marked ready for handoff",
        actor: "Operations",
        timestamp: nowLabel(),
        tone: "success",
        kind: "handoff",
      });
      return { ...prev, [id]: updated };
    });
  }, []);

  const requestInformation = useCallback((id: string, note: string) => {
    setStore((prev) => {
      const c = prev[id];
      if (!c) return prev;
      const updated = withTimeline({ ...c, status: "info_requested" as CaseStatus }, {
        label: note ? `Information requested — ${note}` : "Information requested",
        actor: "Operations",
        timestamp: nowLabel(),
        tone: "warning",
        kind: "note",
      });
      return { ...prev, [id]: updated };
    });
  }, []);

  const requestCorrection = useCallback((id: string, field: string, note: string) => {
    setStore((prev) => {
      const c = prev[id];
      if (!c) return prev;
      const updated = withTimeline({ ...c, status: "info_requested" as CaseStatus }, {
        label: `Correction requested — ${field}${note ? `: ${note}` : ""}`,
        actor: "Operations",
        timestamp: nowLabel(),
        tone: "warning",
        kind: "note",
      });
      return { ...prev, [id]: updated };
    });
  }, []);

  const resolveOpenItems = useCallback((id: string) => {
    setStore((prev) => {
      const c = prev[id];
      if (!c) return prev;
      const resolvedVerification = c.verification.map((v) =>
        v.state === "mismatch" || v.state === "unable_to_verify" ? { ...v, state: "verified" as const, extracted: v.applicantEntered } : v
      );
      const updated = withTimeline(
        { ...c, verification: resolvedVerification, status: "under_review" as CaseStatus },
        {
          label: "Applicant resubmitted requested items",
          actor: "Applicant",
          timestamp: nowLabel(),
          tone: "success",
          kind: "verification",
        }
      );
      return { ...prev, [id]: updated };
    });
  }, []);

  const addCase = useCallback((input: AddCaseInput) => {
    const id = `${input.business.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
    const ref = `SE-2026-${Math.floor(100000 + Math.random() * 899999)}`;
    const newCase: Case = {
      id,
      ref,
      business: input.business,
      structure: "",
      tradeLicenceNo: "",
      emirate: "",
      signatoryName: "",
      signatoryRole: "",
      signatoryEmail: "",
      signatoryPhone: "",
      status: "invited",
      ageHours: 0,
      assignee: null,
      existingCustomer: false,
      campaignId: input.campaignId,
      segment: input.segment,
      adcbReference: input.adcbReference,
      invitationId: input.invitationId,
      verification: [],
      documents: [],
      timeline: [{ label: "Invitation sent", actor: "Operations", timestamp: nowLabel(), kind: "status" }],
    };
    setStore((prev) => ({ ...prev, [id]: newCase }));
    return id;
  }, []);

  const logEvent = useCallback((id: string, event: TimelineEvent, statusUpdate?: CaseStatus) => {
    setStore((prev) => {
      const c = prev[id];
      if (!c) return prev;
      const updated = withTimeline(statusUpdate ? { ...c, status: statusUpdate } : c, event);
      return { ...prev, [id]: updated };
    });
  }, []);

  const value = useMemo<CaseStoreValue>(
    () => ({
      listCases: () => Object.values(store),
      getCase: (id: string) => store[id],
      markReadyForHandoff,
      requestInformation,
      requestCorrection,
      resolveOpenItems,
      addCase,
      logEvent,
    }),
    [store, markReadyForHandoff, requestInformation, requestCorrection, resolveOpenItems, addCase, logEvent]
  );

  return <CaseStoreContext.Provider value={value}>{children}</CaseStoreContext.Provider>;
}

export function useCaseStore() {
  const ctx = useContext(CaseStoreContext);
  if (!ctx) throw new Error("useCaseStore must be used within CaseStoreProvider");
  return ctx;
}
