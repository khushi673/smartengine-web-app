"use client";

import { useRouter } from "next/navigation";
import { DesktopFrame } from "@/components/ui/DeviceFrame";
import { Panel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableWrap, Th, Td, TrClickable } from "@/components/ui/Table";
import { useCaseStore } from "@/components/shell/CaseStoreContext";
import { useCampaignStore } from "@/components/shell/CampaignStoreContext";

const RESPONSE_WINDOW_HOURS = 72;

export default function NonRespondersPage() {
  const router = useRouter();
  const { listCases } = useCaseStore();
  const { listCampaigns } = useCampaignStore();
  const campaigns = listCampaigns();
  const campaignName = (id?: string) => (id ? campaigns.find((c) => c.id === id)?.name ?? "—" : "—");

  const nonResponders = listCases()
    .filter((c) => c.status === "invited" && c.ageHours >= RESPONSE_WINDOW_HOURS)
    .sort((a, b) => b.ageHours - a.ageHours);

  return (
    <DesktopFrame>
      <Panel className="flex flex-col gap-4 p-4.5">
        <div>
          <h2 className="text-[19px]">Non-responders</h2>
          <span className="text-[13px] text-[var(--muted)]">
            Invited applicants who haven&apos;t opened or started their application within {RESPONSE_WINDOW_HOURS / 24} days. This is a
            filtered view of the same case records — not a separate list.
          </span>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>Business</Th>
              <Th>Campaign</Th>
              <Th>Segment</Th>
              <Th>Invited</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {nonResponders.map((c) => (
              <TrClickable key={c.id} onClick={() => router.push(`/ops/queue/${c.id}`)}>
                <Td>{c.business}</Td>
                <Td>{campaignName(c.campaignId)}</Td>
                <Td>{c.segment ?? "—"}</Td>
                <Td className="tabular-nums">
                  {c.ageHours < 24 ? `${c.ageHours}h ago` : `${Math.round(c.ageHours / 24)}d ago`}
                </Td>
                <Td>
                  <Badge tone="warning">Not opened</Badge>
                </Td>
              </TrClickable>
            ))}
            {nonResponders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-[13px] text-[var(--muted)]">
                  No non-responders right now.
                </td>
              </tr>
            )}
          </tbody>
        </TableWrap>
        <span className="text-[13px] text-[var(--muted)]">Click a row to open the case details page.</span>
      </Panel>
    </DesktopFrame>
  );
}
