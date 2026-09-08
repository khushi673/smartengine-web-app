"use client";

import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";
import { useApplicantDraft } from "@/components/shell/ApplicantDraftContext";
import { useCaseStore } from "@/components/shell/CaseStoreContext";

const DEMO_CASE_ID = "alnoor";

export default function ReviewPage() {
  const { tenant } = useTenantTheme();
  const router = useRouter();
  const { business, signatories, finalDeclarationAccepted, setFinalDeclarationAccepted } = useApplicantDraft();
  const { logEvent } = useCaseStore();

  const submit = () => {
    // Logged against the shared demo case without a status change — this walkthrough
    // reuses a case that's already further along (under review), so appending the
    // event to its audit trail must not regress its current status.
    logEvent(DEMO_CASE_ID, {
      label: "Application resubmitted with corrected details",
      actor: "Applicant",
      timestamp: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      kind: "status",
    });
    router.push("/applicant/confirmation");
  };

  return (
    <PhoneFrame tenant={tenant}>
      <div className="flex flex-col gap-1">
        <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">Step 6 of 6</span>
        <h1 className="text-[19px]">Review your application</h1>
      </div>
      <ProgressSteps total={6} current={6} />

      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <strong className="text-[13px] text-[var(--t-ink-strong,var(--ink-strong))]">Business details</strong>
          <button className="text-[13px] font-bold text-[var(--t-primary,var(--brand))]" onClick={() => router.push("/applicant/business")}>
            Edit
          </button>
        </div>
        <span className="text-[12.5px] text-[var(--t-muted,var(--muted))]">
          {business.legalName || "—"} · {business.structure === "llc" ? "LLC" : business.structure === "sole" ? "Sole establishment" : "Branch"} ·
          Trade licence {business.tradeLicenceNo || "—"} · {business.emirate}
        </span>
      </Card>

      {signatories.map((s, i) => (
        <Card key={s.id} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <strong className="text-[13px] text-[var(--t-ink-strong,var(--ink-strong))]">Signatory {i + 1}</strong>
            <button className="text-[13px] font-bold text-[var(--t-primary,var(--brand))]" onClick={() => router.push("/applicant/signatory")}>
              Edit
            </button>
          </div>
          <span className="text-[12.5px] text-[var(--t-muted,var(--muted))]">
            {s.name || "—"} · {s.role}
          </span>
        </Card>
      ))}

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">Verification status</span>
        <VerifyRow label="Trade licence" hint="Source: Authority registry" tone="success">
          Verified
        </VerifyRow>
        <VerifyRow label="Signatory ID(s)" hint="Cross-checked against uploaded documents" tone="success">
          Matched
        </VerifyRow>
        <VerifyRow label="VAT certificate" hint="Delegated to bank layer" tone="info">
          Bank review required
        </VerifyRow>
      </div>

      <div className="flex flex-col gap-2 rounded-[10px] border border-[var(--border-strong)] bg-[var(--t-wash,var(--surface))] p-3.5">
        <strong className="text-[12.5px] text-[var(--t-ink-strong,var(--ink-strong))]">Final accuracy declaration</strong>
        <label className="flex items-start gap-2.5 text-[12.5px] text-[var(--t-ink,var(--ink))]">
          <input
            type="checkbox"
            className="mt-0.5 accent-[var(--t-primary,var(--brand))]"
            checked={finalDeclarationAccepted}
            onChange={(e) => setFinalDeclarationAccepted(e.target.checked)}
          />
          I have reviewed and corrected the business and signatory information above and declare this application is accurate and
          complete. I understand {tenant === "meridian" ? "Meridian Bank" : "Oblavo"} will complete final due diligence and decisioning.
        </label>
      </div>

      <div className="mt-auto flex gap-2.5 pt-2">
        <Button variant="secondary" onClick={() => router.push("/applicant/signatory")}>
          Back
        </Button>
        <Button className="flex-1" disabled={!finalDeclarationAccepted} onClick={submit}>
          Submit application
        </Button>
      </div>
    </PhoneFrame>
  );
}

function VerifyRow({ label, hint, tone, children }: { label: string; hint: string; tone: "success" | "warning" | "info"; children: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-[var(--t-wash,var(--surface))] p-3">
      <div className="text-[12.5px] text-[var(--t-ink,var(--ink))]">
        {label}
        <div className="text-[11px] text-[var(--t-muted,var(--muted))]">{hint}</div>
      </div>
      <Badge tone={tone} dot>{children}</Badge>
    </div>
  );
}
