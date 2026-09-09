"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { useCaseStore } from "./CaseStoreContext";

// Fixed demo case this walkthrough logs against — same convention as the
// existing resubmission page's DEMO_CASE_ID, since this frontend-only demo
// has no session tying a browser visit to a specific invited applicant.
const DEMO_CASE_ID = "alnoor";

export type ScanStatus = "idle" | "good" | "bad";

export interface BusinessDraft {
  legalName: string;
  structure: string;
  tradeLicenceNo: string;
  emirate: string;
  parentJurisdiction: string;
  licenceExpiry: string;
}

export interface SignatoryDraft {
  id: string;
  name: string;
  idNumber: string;
  role: string;
  mobile: string;
  email: string;
  idUpload: ScanStatus;
}

interface ApplicantDraftValue {
  isExistingCustomer: boolean;
  setIsExistingCustomer: (v: boolean) => void;

  consentAccepted: boolean;
  setConsentAccepted: (v: boolean) => void;

  tradeLicenceUpload: ScanStatus;
  setTradeLicenceUpload: (status: ScanStatus) => void;
  ocrApplied: boolean;
  applyOcrExtraction: () => void;

  business: BusinessDraft;
  updateBusinessField: <K extends keyof BusinessDraft>(field: K, value: BusinessDraft[K]) => void;

  signatories: SignatoryDraft[];
  addSignatory: () => void;
  updateSignatory: (id: string, patch: Partial<SignatoryDraft>) => void;
  removeSignatory: (id: string) => void;
  setSignatoryUpload: (id: string, status: ScanStatus) => void;

  finalDeclarationAccepted: boolean;
  setFinalDeclarationAccepted: (v: boolean) => void;

  reset: () => void;
}

const EXTRACTED_TRADE_LICENCE = {
  legalName: "Al Noor Trading LLC",
  tradeLicenceNo: "774521",
  licenceExpiry: "12 Mar 2027",
};

// Simulates what the bank's own relationship record already holds for a
// returning customer — trusted data, so OCR extraction must not overwrite it.
const EXISTING_CUSTOMER_RECORD = {
  legalName: "Harbor Light Trading LLC",
  structure: "llc",
  tradeLicenceNo: "618204",
  emirate: "Dubai",
  licenceExpiry: "22 Jan 2027",
};

function emptyBusiness(): BusinessDraft {
  return { legalName: "", structure: "llc", tradeLicenceNo: "", emirate: "Dubai", parentJurisdiction: "", licenceExpiry: "" };
}

function makeSignatory(): SignatoryDraft {
  return {
    id: Math.random().toString(36).slice(2, 9),
    name: "",
    idNumber: "",
    // Role, mobile and email are never on an ID document — left blank so the
    // applicant must actively provide them, not inherit a silent default.
    role: "",
    mobile: "",
    email: "",
    idUpload: "idle",
  };
}

const ApplicantDraftContext = createContext<ApplicantDraftValue | null>(null);

function nowLabel() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ApplicantDraftProvider({ children }: { children: ReactNode }) {
  const { logEvent } = useCaseStore();
  const [isExistingCustomer, setIsExistingCustomerState] = useState(false);
  const [consentAccepted, setConsentAcceptedState] = useState(false);
  const [tradeLicenceUpload, setTradeLicenceUploadState] = useState<ScanStatus>("idle");
  const [ocrApplied, setOcrApplied] = useState(false);
  const [business, setBusiness] = useState<BusinessDraft>(emptyBusiness);
  const [signatories, setSignatories] = useState<SignatoryDraft[]>(() => [makeSignatory()]);
  const [finalDeclarationAccepted, setFinalDeclarationAcceptedState] = useState(false);

  const setIsExistingCustomer = useCallback(
    (v: boolean) => {
      setIsExistingCustomerState(v);
      if (v) {
        setBusiness((prev) => ({ ...prev, ...EXISTING_CUSTOMER_RECORD }));
        logEvent(DEMO_CASE_ID, {
          label: "Recognized as an existing Meridian Bank customer",
          actor: "SmartEngine",
          timestamp: nowLabel(),
          kind: "status",
          detail: "Business details pre-filled from the bank's relationship record.",
        });
      } else {
        setBusiness(emptyBusiness());
      }
    },
    [logEvent]
  );

  const setConsentAccepted = useCallback(
    (v: boolean) => {
      setConsentAcceptedState(v);
      if (v) {
        logEvent(DEMO_CASE_ID, {
          label: "Privacy notice & processing consent accepted",
          actor: "Applicant",
          timestamp: nowLabel(),
          kind: "consent",
        });
      }
    },
    [logEvent]
  );

  const setTradeLicenceUpload = useCallback(
    (status: ScanStatus) => {
      setTradeLicenceUploadState(status);
      if (status === "good") {
        logEvent(DEMO_CASE_ID, {
          label: "Trade licence uploaded — quality passed",
          actor: "Applicant",
          timestamp: nowLabel(),
          kind: "document",
        });
      } else if (status === "bad") {
        logEvent(DEMO_CASE_ID, {
          label: "Trade licence upload unreadable",
          actor: "Applicant",
          timestamp: nowLabel(),
          tone: "warning",
          kind: "document",
        });
      }
    },
    [logEvent]
  );

  const applyOcrExtraction = useCallback(() => {
    setOcrApplied(true);
    if (isExistingCustomer) {
      // The bank's own relationship record is trusted data — OCR only cross-checks
      // it here, it must never overwrite it.
      logEvent(DEMO_CASE_ID, {
        label: "OCR extraction cross-checked against existing customer record",
        actor: "SmartEngine",
        timestamp: nowLabel(),
        kind: "document",
        detail: "Scanned trade licence matches the details already on file — no changes applied.",
      });
      return;
    }
    setBusiness((prev) => ({ ...prev, ...EXTRACTED_TRADE_LICENCE }));
    logEvent(DEMO_CASE_ID, {
      label: "OCR extraction applied to business details",
      actor: "SmartEngine",
      timestamp: nowLabel(),
      kind: "document",
      detail: "Legal name, trade licence number and expiry prefilled from trade licence scan.",
    });
  }, [logEvent, isExistingCustomer]);

  const updateBusinessField = useCallback(
    <K extends keyof BusinessDraft>(field: K, value: BusinessDraft[K]) => {
      setBusiness((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const addSignatory = useCallback(() => {
    const nextIndex = signatories.length + 1;
    setSignatories((prev) => [...prev, makeSignatory()]);
    logEvent(DEMO_CASE_ID, {
      label: `Signatory ${nextIndex} added`,
      actor: "Applicant",
      timestamp: nowLabel(),
      kind: "signatory",
    });
  }, [signatories.length, logEvent]);

  const updateSignatory = useCallback((id: string, patch: Partial<SignatoryDraft>) => {
    setSignatories((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const removeSignatory = useCallback(
    (id: string) => {
      if (signatories.length <= 1) return;
      setSignatories((prev) => prev.filter((s) => s.id !== id));
      logEvent(DEMO_CASE_ID, {
        label: "Signatory removed",
        actor: "Applicant",
        timestamp: nowLabel(),
        kind: "signatory",
      });
    },
    [signatories.length, logEvent]
  );

  const setSignatoryUpload = useCallback(
    (id: string, status: ScanStatus) => {
      setSignatories((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          if (status === "good") {
            const index = prev.findIndex((p) => p.id === id);
            return {
              ...s,
              idUpload: status,
              name: s.name || `Signatory ${index + 1} (from ID)`,
              idNumber: s.idNumber || `784-19${Math.floor(10000000000 + Math.random() * 89999999999)}`,
            };
          }
          return { ...s, idUpload: status };
        })
      );
      if (status === "good") {
        logEvent(DEMO_CASE_ID, {
          label: "Signatory ID uploaded — quality passed",
          actor: "Applicant",
          timestamp: nowLabel(),
          kind: "document",
        });
      }
    },
    [logEvent]
  );

  const setFinalDeclarationAccepted = useCallback(
    (v: boolean) => {
      setFinalDeclarationAcceptedState(v);
      if (v) {
        logEvent(DEMO_CASE_ID, {
          label: "Final accuracy declaration accepted",
          actor: "Applicant",
          timestamp: nowLabel(),
          kind: "consent",
        });
      }
    },
    [logEvent]
  );

  const reset = useCallback(() => {
    setIsExistingCustomerState(false);
    setConsentAcceptedState(false);
    setTradeLicenceUploadState("idle");
    setOcrApplied(false);
    setBusiness(emptyBusiness());
    setSignatories([makeSignatory()]);
    setFinalDeclarationAcceptedState(false);
  }, []);

  const value = useMemo<ApplicantDraftValue>(
    () => ({
      isExistingCustomer,
      setIsExistingCustomer,
      consentAccepted,
      setConsentAccepted,
      tradeLicenceUpload,
      setTradeLicenceUpload,
      ocrApplied,
      applyOcrExtraction,
      business,
      updateBusinessField,
      signatories,
      addSignatory,
      updateSignatory,
      removeSignatory,
      setSignatoryUpload,
      finalDeclarationAccepted,
      setFinalDeclarationAccepted,
      reset,
    }),
    [
      isExistingCustomer,
      setIsExistingCustomer,
      consentAccepted,
      setConsentAccepted,
      tradeLicenceUpload,
      setTradeLicenceUpload,
      ocrApplied,
      applyOcrExtraction,
      business,
      updateBusinessField,
      signatories,
      addSignatory,
      updateSignatory,
      removeSignatory,
      setSignatoryUpload,
      finalDeclarationAccepted,
      setFinalDeclarationAccepted,
      reset,
    ]
  );

  return <ApplicantDraftContext.Provider value={value}>{children}</ApplicantDraftContext.Provider>;
}

export function useApplicantDraft() {
  const ctx = useContext(ApplicantDraftContext);
  if (!ctx) throw new Error("useApplicantDraft must be used within ApplicantDraftProvider");
  return ctx;
}
