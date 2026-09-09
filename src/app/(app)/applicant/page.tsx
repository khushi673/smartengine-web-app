"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TenantHeader, tenantLabel } from "@/components/applicant/TenantHeader";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";

const checklist = ["Trade licence", "Signatory Emirates ID", "VAT certificate (if registered)"];

export default function InvitationPage() {
  const [expired, setExpired] = useState(false);
  const { tenant } = useTenantTheme();
  const router = useRouter();

  return (
    <PhoneFrame tenant={tenant}>
      <TenantHeader />

      {!expired ? (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">
              Merchant onboarding
            </span>
            <h1 className="text-[22px] leading-tight">You&apos;re invited to complete your merchant application</h1>
            <p className="text-[13px] text-[var(--t-muted,var(--muted))]">
              This link was sent to you by {tenantLabel(tenant)}. It&apos;s secure and unique to your business.
            </p>
          </div>

          <Card flat className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">What you&apos;ll need</span>
              <Badge tone="info">~12–15 min</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {checklist.map((item) => (
                <div key={item} className="flex items-center gap-2 text-[13px] text-[var(--t-ink,var(--ink))]">
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8l3 3 7-7" stroke="var(--success-solid)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <p className="text-[13px] text-[var(--t-muted,var(--muted))]">
            Your progress is saved automatically — you can leave and return using this same link at any time.
          </p>

          <Button block onClick={() => router.push("/applicant/identity")}>
            Continue
          </Button>

          <div className="mt-2 flex flex-col gap-1.5 rounded-[10px] border border-dashed border-[var(--border-strong)] p-3">
            <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-muted,var(--muted))] uppercase">Demo controls</span>
            <Button block variant="ghost" onClick={() => setExpired(true)}>
              Preview: expired link state
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2.5 pt-10 text-center">
          <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[var(--warning-bg)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5M12 16h.01" stroke="var(--warning-text)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="var(--warning-text)" strokeWidth="1.6" />
            </svg>
          </div>
          <h1 className="text-[19px]">This invitation link has expired</h1>
          <p className="text-[13px] text-[var(--t-muted,var(--muted))]">
            For your security, invitation links expire after 14 days. No application data is shown until a new link is issued.
          </p>
          <Button variant="secondary" onClick={() => setExpired(false)}>
            Back to valid preview
          </Button>
          <span className="text-[13px] text-[var(--t-muted,var(--muted))]">
            Need a new link? Contact your {tenant === "meridian" ? "Meridian Bank" : "Oblavo"} relationship manager.
          </span>
        </div>
      )}
    </PhoneFrame>
  );
}
