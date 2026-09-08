import { ReactNode } from "react";
import { CaseStatus, CASE_STATUS_LABEL, VerificationState, VERIFICATION_LABEL, InvitationStatus, INVITATION_STATUS_LABEL } from "@/lib/mock-data";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-[var(--success-bg)] text-[var(--success-text)]",
  warning: "bg-[var(--warning-bg)] text-[var(--warning-text)]",
  danger: "bg-[var(--danger-bg)] text-[var(--danger-text)]",
  info: "bg-[var(--info-bg)] text-[var(--info-text)]",
  neutral: "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]",
};

function ToneIcon({ tone }: { tone: Tone }) {
  const common = { width: 10, height: 10, viewBox: "0 0 16 16", "aria-hidden": true } as const;
  if (tone === "success") {
    return (
      <svg {...common} fill="none">
        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tone === "warning" || tone === "danger") {
    return (
      <svg {...common} fill="none">
        <path d="M8 2l7 12H1L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M8 6.5v3M8 11.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  return <span className="h-1.5 w-1.5 rounded-full bg-current" />;
}

export function Badge({ tone = "neutral", dot, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${toneClasses[tone]}`}>
      {dot && <ToneIcon tone={tone} />}
      {children}
    </span>
  );
}

const caseStatusTone: Record<CaseStatus, Tone> = {
  invited: "neutral",
  in_progress: "info",
  submitted: "neutral",
  under_review: "info",
  info_requested: "danger",
  verification_exception: "danger",
  ready_for_handoff: "success",
  handed_off: "success",
  approved: "success",
  rejected: "neutral",
  closed: "neutral",
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return (
    <Badge tone={caseStatusTone[status]} dot>
      {CASE_STATUS_LABEL[status]}
    </Badge>
  );
}

const invitationStatusTone: Record<InvitationStatus, Tone> = {
  sent: "neutral",
  delivered: "info",
  failed: "danger",
  opened: "info",
  expired: "danger",
  cancelled: "neutral",
};

export function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  return (
    <Badge tone={invitationStatusTone[status]} dot>
      {INVITATION_STATUS_LABEL[status]}
    </Badge>
  );
}

const verificationTone: Record<VerificationState, Tone> = {
  verified: "success",
  matched: "success",
  partially_matched: "warning",
  mismatch: "warning",
  unable_to_verify: "danger",
  bank_review_required: "info",
  pending: "neutral",
  integration_unavailable: "neutral",
};

export function VerificationBadge({ state }: { state: VerificationState }) {
  return (
    <Badge tone={verificationTone[state]} dot>
      {VERIFICATION_LABEL[state]}
    </Badge>
  );
}
