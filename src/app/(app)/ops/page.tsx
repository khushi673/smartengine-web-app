"use client";

import Link from "next/link";
import { DesktopFrame } from "@/components/ui/DeviceFrame";
import { Panel } from "@/components/ui/Card";
import { KpiTile } from "@/components/ui/KpiTile";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { dashboardMetrics, cases } from "@/lib/mock-data";

export default function OpsDashboardPage() {
  const m = dashboardMetrics;

  return (
    <DesktopFrame>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[19px]">Operations dashboard</h2>
            <span className="text-[13px] text-[var(--muted)]">Meridian Bank · Q3 Merchant Card Programme</span>
          </div>
          <Link href="/ops/campaigns/new">
            <Button size="sm">+ New campaign</Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          <KpiTile value={m.invited.toLocaleString()} label="Invited" delta={m.invitedDelta} />
          <KpiTile value={m.opened.toLocaleString()} label="Opened" delta={m.openedDelta} />
          <KpiTile value={m.submitted.toLocaleString()} label="Submitted" delta={m.submittedDelta} />
          <KpiTile value={m.infoRequested} label="Info requested" tone="warning" delta={m.infoRequestedDelta} deltaTone="warning" />
          <KpiTile value={m.readyForHandoff} label="Ready for handoff" tone="success" delta={m.readyForHandoffDelta} />
          <KpiTile value={m.handedOff} label="Handed off" delta={m.handedOffDelta} />
        </div>

        <div className="flex flex-wrap items-stretch gap-4">
          <Panel className="min-w-80 flex-2 p-4.5">
            <div className="mb-3 flex items-center justify-between">
              <strong className="text-[13px]">Campaign progress</strong>
              <Badge tone="info">Live</Badge>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[13px]">
                <span>Applications submitted</span>
                <span className="tabular-nums text-[var(--muted)]">
                  {m.submitted.toLocaleString()} / {m.invited.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                <span
                  className="block h-full rounded-full bg-[var(--brand)]"
                  style={{ width: `${Math.round((m.submitted / m.invited) * 100)}%` }}
                />
              </div>
            </div>
            <hr className="my-4 border-[var(--border)]" />
            <div className="mb-2 flex items-center justify-between text-[13px]">
              <strong>Non-responders (7+ days)</strong>
              <Link href="/ops/non-responders" className="font-bold text-[var(--brand)]">
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-[13px]">
              {m.nonResponders.map((n) => {
                const matchedCase = cases.find((c) => c.business === n.business);
                const row = (
                  <div className="flex justify-between">
                    <span>{n.business}</span>
                    <span className="tabular-nums text-[var(--muted)]">Invited {n.invitedDaysAgo} days ago</span>
                  </div>
                );
                return matchedCase ? (
                  <Link key={n.business} href={`/ops/queue/${matchedCase.id}`} className="rounded-md transition-colors hover:text-[var(--brand)]">
                    {row}
                  </Link>
                ) : (
                  <div key={n.business}>{row}</div>
                );
              })}
            </div>
          </Panel>

          <Panel className="min-w-60 flex-1 p-4.5">
            <strong className="text-[13px]">Exceptions needing attention</strong>
            <div className="mt-3 flex flex-col gap-2.5">
              {m.exceptions.map((e) => (
                <div key={e.label} className="flex justify-between text-[13px]">
                  <span>{e.label}</span>
                  <Badge tone={e.tone}>{e.count}</Badge>
                </div>
              ))}
            </div>
            <Link
              href="/ops/queue"
              className="mt-3.5 inline-flex w-full items-center justify-center rounded-md border-[1.5px] border-[var(--border-strong)] px-3 py-1.5 text-[12.5px] font-bold text-[var(--brand)] hover:bg-[var(--surface)]"
            >
              Open case queue
            </Link>
          </Panel>
        </div>
      </div>
    </DesktopFrame>
  );
}
