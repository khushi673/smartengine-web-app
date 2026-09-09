"use client";

import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Field, Input, Select } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";
import { useApplicantDraft } from "@/components/shell/ApplicantDraftContext";

const STRUCTURES = [
  { value: "llc", label: "LLC" },
  { value: "sole", label: "Sole establishment" },
  { value: "branch", label: "Branch (foreign entity)" },
];

export default function BusinessDetailsPage() {
  const { tenant } = useTenantTheme();
  const router = useRouter();
  const { business, updateBusinessField, ocrApplied, isExistingCustomer } = useApplicantDraft();

  const canContinue = business.legalName.trim().length > 0 && business.tradeLicenceNo.trim().length > 0;

  return (
    <PhoneFrame tenant={tenant}>
      <div className="flex flex-col gap-1">
        <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">
          Step 4 of 6 · Business details
        </span>
        <h1 className="text-[19px]">Review your business details</h1>
      </div>
      <ProgressSteps total={6} current={4} />

      {(isExistingCustomer || ocrApplied) && (
        <Card flat className="flex items-start gap-2.5 border-[var(--info-text)]/30 bg-[var(--info-bg)]">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
            <circle cx="10" cy="10" r="7" stroke="var(--info-text)" strokeWidth="1.5" />
            <path d="M10 9v4M10 6.5h.01" stroke="var(--info-text)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="text-[12.5px] text-[var(--t-ink,var(--ink))]">
            {isExistingCustomer
              ? "We recognized this business as an existing Meridian Bank customer — details below are pre-filled from your relationship record. Please review and confirm."
              : "Pre-filled from your trade licence scan — please review and correct anything that's wrong."}
          </span>
        </Card>
      )}

      <Field label="Legal business name">
        <Input value={business.legalName} onChange={(e) => updateBusinessField("legalName", e.target.value)} placeholder="As shown on trade licence" />
      </Field>

      <Field label="Business structure" hint="Additional fields appear based on your selection.">
        <div className="flex flex-wrap gap-2">
          {STRUCTURES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => updateBusinessField("structure", s.value)}
              className={`rounded-lg border-[1.5px] px-3 py-2.5 text-[12.5px] font-semibold ${
                business.structure === s.value
                  ? "border-[var(--t-primary,var(--brand))] bg-[var(--t-wash,var(--brand-wash))] text-[var(--t-primary,var(--brand))]"
                  : "border-[var(--border-strong)] bg-[var(--t-surface,var(--surface-2))] text-[var(--t-ink,var(--ink))]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Field>

      {business.structure === "branch" && (
        <Field label="Parent company jurisdiction" hint="Required for branches of foreign entities.">
          <Input
            value={business.parentJurisdiction}
            onChange={(e) => updateBusinessField("parentJurisdiction", e.target.value)}
            placeholder="e.g. United Kingdom"
          />
        </Field>
      )}

      <Field label="Trade licence number">
        <Input value={business.tradeLicenceNo} onChange={(e) => updateBusinessField("tradeLicenceNo", e.target.value)} />
      </Field>

      <Field label="Emirate of registration">
        <Select value={business.emirate} onChange={(e) => updateBusinessField("emirate", e.target.value)}>
          <option>Dubai</option>
          <option>Abu Dhabi</option>
          <option>Sharjah</option>
        </Select>
      </Field>

      <span className="text-[11.5px] text-[var(--t-muted,var(--muted))]">Draft saved automatically · last saved just now</span>

      <div className="mt-auto flex gap-2.5 pt-2">
        <Button variant="secondary" onClick={() => router.push("/applicant/processing")}>
          Back
        </Button>
        <Button className="flex-1" disabled={!canContinue} onClick={() => router.push("/applicant/signatory")}>
          Continue
        </Button>
      </div>
    </PhoneFrame>
  );
}
