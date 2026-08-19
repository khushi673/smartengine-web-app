"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";

export default function ReviewPage() {
  const [confirmed, setConfirmed] = useState(true);
  const { tenant } = useTenantTheme();
  const router = useRouter();

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
        <span className="text-[12.5px] text-[var(--t-muted,var(--muted))]">Al Noor Trading LLC · LLC · Trade licence 774521 · Dubai</span>
      </Card>

      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <strong className="text-[13px] text-[var(--t-ink-strong,var(--ink-strong))]">Signatory</strong>
          <button className="text-[13px] font-bold text-[var(--t-primary,var(--brand))]" onClick={() => router.push("/applicant/signatory")}>
            Edit
          </button>
        </div>
        <span className="text-[12.5px] text-[var(--t-muted,var(--muted))]">Fatima Al Suwaidi · General Manager (POA)</span>
      </Card>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">Verification status</span>
        <VerifyRow label="Trade licence" hint="Source: Authority registry" tone="success">Verified</VerifyRow>
        <VerifyRow label="Emirates ID" hint="Expiry differs from extracted value" tone="warning">Partially matched</VerifyRow>
        <VerifyRow label="VAT certificate" hint="Delegated to bank layer" tone="info">Bank review required</VerifyRow>
      </div>

      <label className="flex items-start gap-2.5 text-[12.5px] text-[var(--t-ink,var(--ink))]">
        <input type="checkbox" className="mt-0.5 accent-[var(--t-primary,var(--brand))]" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
        I confirm the details above are accurate. I understand {tenant === "meridian" ? "Meridian Bank" : "Oblavo"} will complete final due diligence and decisioning.
      </label>

      <div className="mt-auto flex gap-2.5 pt-2">
        <Button variant="secondary" onClick={() => router.push("/applicant/processing")}>Back</Button>
        <Button className="flex-1" disabled={!confirmed} onClick={() => router.push("/applicant/confirmation")}>
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
