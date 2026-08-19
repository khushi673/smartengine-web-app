"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useViewMode } from "@/components/shell/ViewModeContext";

const STEPS = [
  { href: "/applicant/consent", label: "Consent & declaration" },
  { href: "/applicant/business", label: "Business details" },
  { href: "/applicant/signatory", label: "Signatory details" },
  { href: "/applicant/documents", label: "Document upload" },
  { href: "/applicant/processing", label: "AI processing & extraction" },
  { href: "/applicant/review", label: "Review & submit" },
];

const TENANT_LABEL: Record<"oblavo" | "meridian", string> = {
  oblavo: "Oblavo",
  meridian: "Meridian Bank",
};
export function PhoneFrame({ children, tenant = "meridian" }: { children: ReactNode; tenant?: "oblavo" | "meridian" }) {
  const { viewMode } = useViewMode();
  const pathname = usePathname();

  if (viewMode === "web") {
    return <ApplicantWebFrame tenant={tenant} pathname={pathname}>{children}</ApplicantWebFrame>;
  }

  return (
    <div className="flex flex-col items-center gap-3.5">
      <span className="text-[11px] font-semibold text-[var(--muted)]">Applicant · Mobile-first</span>
      <div
        data-tenant={tenant}
        className="relative flex min-h-[760px] w-[390px] flex-col overflow-hidden rounded-[38px] border-[10px] border-[var(--ink-strong)] shadow-2xl"
        style={{ background: "var(--t-bg, var(--bg))" }}
      >
        <div className="absolute top-0 left-1/2 z-10 h-[22px] w-[120px] -translate-x-1/2 rounded-b-2xl bg-[var(--ink-strong)]" />
        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-5 pt-[38px] pb-6">{children}</div>
      </div>
    </div>
  );
}

function ApplicantWebFrame({
  children,
  tenant,
  pathname,
}: {
  children: ReactNode;
  tenant: "oblavo" | "meridian";
  pathname: string;
}) {
  const stepIndex = STEPS.findIndex((s) => s.href === pathname);
  const panelMode = pathname === "/applicant" ? "start" : pathname === "/applicant/confirmation" ? "done" : pathname === "/applicant/resubmission" ? "action" : "steps";

  return (
    <div data-tenant={tenant} className="h-full w-full overflow-hidden bg-[var(--bg)]">
        <div
          className="flex h-full items-stretch"
          style={{ background: "var(--t-bg, var(--bg))" }}
        >
          {/* left context panel — not a stretched mobile form, a genuinely different desktop composition */}
          <aside
            className="hidden w-[300px] shrink-0 flex-col gap-6 border-r border-[var(--border)] p-7 md:flex"
            style={{ background: "var(--t-wash, var(--surface))" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: "var(--t-primary, var(--brand))" }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <div className="flex flex-col">
                <strong className="text-[13.5px]" style={{ color: "var(--t-ink-strong, var(--ink-strong))" }}>{TENANT_LABEL[tenant]}</strong>
                <span className="text-[10.5px] text-[var(--t-muted,var(--muted))]">via Oblavo SmartEngine</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">Merchant onboarding</span>
              <span className="text-[13px] text-[var(--t-muted,var(--muted))]">Commercial Card Programme application</span>
            </div>

            {panelMode === "steps" && (
              <ol className="flex flex-col gap-4">
                {STEPS.map((s, i) => {
                  const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "upcoming";
                  return (
                    <li key={s.href} className="flex items-center gap-2.5">
                      <span
                        className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          state === "done"
                            ? "text-white"
                            : state === "active"
                              ? "border-2"
                              : "border border-[var(--border-strong)] text-[var(--t-muted,var(--muted))]"
                        }`}
                        style={
                          state === "done"
                            ? { background: "var(--success-solid)" }
                            : state === "active"
                              ? { borderColor: "var(--t-primary, var(--brand))", color: "var(--t-primary, var(--brand))" }
                              : undefined
                        }
                      >
                        {state === "done" ? "✓" : i + 1}
                      </span>
                      <span
                        className={`text-[12.5px] ${state === "active" ? "font-bold" : ""}`}
                        style={{ color: state === "upcoming" ? "var(--t-muted, var(--muted))" : "var(--t-ink, var(--ink))" }}
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            {panelMode === "start" && (
              <p className="text-[12.5px] text-[var(--t-muted,var(--muted))]">
                6 quick steps · about 12–15 minutes · save and resume anytime on this device or your phone.
              </p>
            )}

            {panelMode === "done" && (
              <ol className="flex flex-col gap-4">
                {STEPS.map((s) => (
                  <li key={s.href} className="flex items-center gap-2.5">
                    <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "var(--success-solid)" }}>✓</span>
                    <span className="text-[12.5px] text-[var(--t-ink,var(--ink))]">{s.label}</span>
                  </li>
                ))}
              </ol>
            )}

            {panelMode === "action" && (
              <div className="flex flex-col gap-2 rounded-[10px] p-3.5" style={{ background: "var(--warning-bg)" }}>
                <strong className="text-[12.5px]" style={{ color: "var(--warning-text)" }}>⚠ Action needed</strong>
                <span className="text-[11.5px]" style={{ color: "var(--warning-text)" }}>
                  {TENANT_LABEL[tenant]} needs one item from you before this application can proceed.
                </span>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-1 border-t border-[var(--border)] pt-4">
              <span className="text-[11px] font-semibold text-[var(--t-muted,var(--muted))]">Your progress is saved automatically</span>
              <span className="text-[10.5px] text-[var(--t-muted,var(--muted))]">Return using this same link on any device.</span>
            </div>
          </aside>

          {/* right content — same components as mobile, recomposed with desktop breathing room */}
          <div className="flex flex-1 justify-center overflow-y-auto px-10 py-10">
            <div className="flex w-full max-w-[520px] flex-col gap-[18px]">{children}</div>
          </div>
        </div>
    </div>
  );
}

export function DesktopFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl">
      <div className="px-[30px] pt-[26px] pb-10">{children}</div>
    </div>
  );
}
