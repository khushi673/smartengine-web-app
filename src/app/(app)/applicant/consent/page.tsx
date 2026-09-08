"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";
import { useApplicantDraft } from "@/components/shell/ApplicantDraftContext";

export default function ConsentPage() {
  const [checked, setChecked] = useState([false, false]);
  const { tenant } = useTenantTheme();
  const router = useRouter();
  const { setConsentAccepted } = useApplicantDraft();
  const allChecked = checked.every(Boolean);

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <PhoneFrame tenant={tenant}>
      <div className="flex flex-col gap-1">
        <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">
          Step 1 of 6
        </span>
        <h1 className="text-[19px]">Privacy &amp; consent</h1>
      </div>
      <ProgressSteps total={6} current={1} />

      <div className="max-h-55 overflow-y-auto rounded-[10px] border border-[var(--border)] bg-[var(--t-surface,var(--surface-2))] p-4 text-[12.5px] leading-relaxed text-[var(--t-muted,var(--muted))]">
        <strong className="text-[var(--t-ink,var(--ink))]">Privacy &amp; Data Handling Notice · v2.3</strong>
        <br />
        <br />
        {tenant === "meridian" ? "Meridian Bank" : "Oblavo"} and Oblavo SmartEngine will collect, process, extract, verify and transfer the
        business and identity information you submit — including from documents you upload or scan — for the sole purpose of merchant
        onboarding evaluation. No document will be read or processed until you accept below. Documents are stored securely and only
        accessed by authorised bank personnel and approved verification providers strictly for this application.
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-start gap-2.5 text-[12.5px] text-[var(--t-ink,var(--ink))]">
          <input type="checkbox" className="mt-0.5 accent-[var(--t-primary,var(--brand))]" checked={checked[0]} onChange={() => toggle(0)} />
          I confirm the information I provide will be accurate and complete to the best of my knowledge.
        </label>
        <label className="flex items-start gap-2.5 text-[12.5px] text-[var(--t-ink,var(--ink))]">
          <input type="checkbox" className="mt-0.5 accent-[var(--t-primary,var(--brand))]" checked={checked[1]} onChange={() => toggle(1)} />
          I have read and accept the Privacy &amp; Data Handling Notice v2.3 and consent to the collection, processing, extraction,
          verification and transfer of my information described above.
        </label>
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pt-2">
        <Button
          block
          disabled={!allChecked}
          onClick={() => {
            setConsentAccepted(true);
            router.push("/applicant/documents");
          }}
        >
          Accept &amp; continue
        </Button>
        <Button block variant="ghost" onClick={() => router.push("/applicant")}>
          Back
        </Button>
      </div>
    </PhoneFrame>
  );
}
