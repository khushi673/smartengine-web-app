"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DesktopFrame } from "@/components/ui/DeviceFrame";
import { Panel } from "@/components/ui/Card";
import { TableWrap, Th, Td, TrClickable } from "@/components/ui/Table";
import { CaseStatusBadge, Badge } from "@/components/ui/Badge";
import { Case } from "@/lib/mock-data";
import { useCaseStore } from "@/components/shell/CaseStoreContext";
import { useCampaignStore } from "@/components/shell/CampaignStoreContext";

const SLA_APPROACHING_HOURS = 48;
const SLA_BREACHED_HOURS = 72;
const TERMINAL_STATUSES: Case["status"][] = ["approved", "rejected", "closed", "handed_off"];

function slaFlag(c: Case): "none" | "approaching" | "breached" {
  if (TERMINAL_STATUSES.includes(c.status)) return "none";
  if (c.ageHours >= SLA_BREACHED_HOURS) return "breached";
  if (c.ageHours >= SLA_APPROACHING_HOURS) return "approaching";
  return "none";
}

interface View {
  key: string;
  label: string;
  predicate: (c: Case) => boolean;
}

const VIEWS: View[] = [
  {
    key: "requires_action",
    label: "Cases requiring action",
    predicate: (c) =>
      c.status === "info_requested" ||
      c.status === "verification_exception" ||
      c.status === "under_review" ||
      c.status === "ready_for_handoff" ||
      slaFlag(c) !== "none",
  },
  { key: "all", label: "All cases", predicate: () => true },
  { key: "not_opened", label: "Invitations not opened", predicate: (c) => c.status === "invited" },
  { key: "in_progress", label: "Applications in progress", predicate: (c) => c.status === "in_progress" },
  { key: "sla", label: "SLA approaching or breached", predicate: (c) => slaFlag(c) !== "none" },
  { key: "info_requested", label: "Requires information", predicate: (c) => c.status === "info_requested" },
  { key: "verification_exception", label: "Verification exceptions", predicate: (c) => c.status === "verification_exception" },
  { key: "ready_for_review", label: "Ready for review", predicate: (c) => c.status === "under_review" },
  { key: "ready_for_handoff", label: "Ready for handoff", predicate: (c) => c.status === "ready_for_handoff" },
  { key: "handed_off", label: "Handed off", predicate: (c) => c.status === "handed_off" },
  {
    key: "closed_out",
    label: "Completed, rejected, or closed",
    predicate: (c) => c.status === "approved" || c.status === "rejected" || c.status === "closed",
  },
];

export default function CaseQueuePage() {
  const router = useRouter();
  const { listCases } = useCaseStore();
  const { listCampaigns } = useCampaignStore();
  const [search, setSearch] = useState("");
  const [viewKey, setViewKey] = useState(VIEWS[0].key);
  const [campaignId, setCampaignId] = useState("all");

  const cases = listCases();
  const campaigns = listCampaigns();
  const view = VIEWS.find((v) => v.key === viewKey) ?? VIEWS[0];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases.filter((c) => {
      const matchesSearch = !q || c.business.toLowerCase().includes(q) || c.ref.toLowerCase().includes(q);
      const matchesCampaign = campaignId === "all" || c.campaignId === campaignId;
      return matchesSearch && matchesCampaign && view.predicate(c);
    });
  }, [cases, search, campaignId, view]);

  return (
    <DesktopFrame>
      <Panel className="flex flex-col gap-4 p-4.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[19px]">Case queue</h2>
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, ref…"
              className="min-w-40 flex-1 rounded-md border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--brand)]"
            />
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="min-w-36 rounded-md border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-[13px]"
            >
              <option value="all">All campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={viewKey}
              onChange={(e) => setViewKey(e.target.value)}
              className="min-w-44 rounded-md border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-[13px]"
            >
              {VIEWS.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>Case</Th>
              <Th>Business</Th>
              <Th>Status</Th>
              <Th>SLA</Th>
              <Th>Exceptions</Th>
              <Th>Age</Th>
              <Th>Assignee</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const mismatches = c.verification.filter((v) => v.state === "mismatch" || v.state === "unable_to_verify").length;
              const sla = slaFlag(c);
              return (
                <TrClickable key={c.id} onClick={() => router.push(`/ops/queue/${c.id}`)}>
                  <Td className="tabular-nums">{c.ref}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span>{c.business}</span>
                      {c.existingCustomer && <Badge tone="info">Existing customer</Badge>}
                    </div>
                  </Td>
                  <Td><CaseStatusBadge status={c.status} /></Td>
                  <Td>
                    {sla === "breached" && <Badge tone="danger">Breached</Badge>}
                    {sla === "approaching" && <Badge tone="warning">Approaching</Badge>}
                    {sla === "none" && <Badge tone="neutral">On track</Badge>}
                  </Td>
                  <Td>
                    {mismatches > 0 ? (
                      <Badge tone="warning">{mismatches} mismatch{mismatches > 1 ? "es" : ""}</Badge>
                    ) : (
                      <Badge tone="neutral">None</Badge>
                    )}
                  </Td>
                  <Td className="tabular-nums">{c.ageHours < 24 ? `${c.ageHours}h` : `${Math.round(c.ageHours / 24)}d`}</Td>
                  <Td>{c.assignee ?? "Unassigned"}</Td>
                </TrClickable>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-[13px] text-[var(--muted)]">
                  No cases match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </TableWrap>
        <span className="text-[13px] text-[var(--muted)]">Click any row to open the case workspace.</span>
      </Panel>
    </DesktopFrame>
  );
}
