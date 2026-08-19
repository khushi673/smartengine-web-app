"use client";

import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";
import { useCaseStore } from "@/components/shell/CaseStoreContext";

const DEMO_CASE_ID = "alnoor";

export default function ResubmissionPage() {
  const { tenant } = useTenantTheme();
  const { getCase, resolveOpenItems } = useCaseStore();
  const c = getCase(DEMO_CASE_ID);

  if (!c) return null;

  const openItems = c.verification.filter((v) => v.state === "mismatch" || v.state === "unable_to_verify");
  const resolved = openItems.length === 0;

  return (
    <PhoneFrame tenant={tenant}>
      {!resolved ? (
        <div className="flex flex-col gap-4">
          <Badge tone="warning" dot>Action needed</Badge>
          <div className="flex flex-col gap-1">
            <h1 className="text-[16px]">
              {tenant === "meridian" ? "Meridian Bank" : "Oblavo"} needs {openItems.length} item{openItems.length > 1 ? "s" : ""} from you
            </h1>
            <p className="text-[12.3px] text-[var(--t-muted,var(--muted))]">Requested by Operations · reference {c.ref}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {openItems.map((v) => (
              <div key={v.field} className="rounded-[10px] border border-[var(--border)] bg-[var(--t-surface,var(--surface-2))] p-3.5">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <strong className="text-[13px] text-[var(--t-ink-strong,var(--ink-strong))]">{v.field}</strong>
                  <Badge tone="warning">{v.state === "mismatch" ? "Confirm" : "Re-verify"}</Badge>
                </div>
                <p className="text-[12px] text-[var(--t-muted,var(--muted))]">
                  You entered {v.applicantEntered}
                  {v.extracted !== "—" ? `, the document shows ${v.extracted}` : ", we could not verify this against the source"}. Please
                  confirm the correct value or re-upload a clearer copy.
                </p>
              </div>
            ))}
          </div>

          <Button block onClick={() => resolveOpenItems(c.id)}>
            Resolve requested items
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5 pt-14 text-center">
          <Badge tone="success" dot>Resolved</Badge>
          <h1 className="text-[16px]">Thanks — everything is updated</h1>
          <p className="text-[12px] text-[var(--t-muted,var(--muted))]">
            {tenant === "meridian" ? "Meridian Bank's" : "Oblavo's"} operations team has been notified and will resume review.
          </p>
        </div>
      )}
    </PhoneFrame>
  );
}
