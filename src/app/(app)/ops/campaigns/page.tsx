"use client";

import Link from "next/link";
import { DesktopFrame } from "@/components/ui/DeviceFrame";
import { Panel } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableWrap, Th, Td, TrClickable } from "@/components/ui/Table";
import { useCampaignStore } from "@/components/shell/CampaignStoreContext";
import { useCaseStore } from "@/components/shell/CaseStoreContext";
import { CAMPAIGN_STATUS_LABEL } from "@/lib/mock-data";
import { useRouter } from "next/navigation";

export default function CampaignsPage() {
  const router = useRouter();
  const { listCampaigns, listInvitationsForCampaign } = useCampaignStore();
  const { listCases } = useCaseStore();
  const cases = listCases();
  const campaigns = listCampaigns();

  return (
    <DesktopFrame>
      <Panel className="flex flex-col gap-4 p-4.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[19px]">Campaigns</h2>
            <span className="text-[13px] text-[var(--muted)]">
              Every individual and bulk invitation belongs to a named campaign.
            </span>
          </div>
          <Link href="/ops/campaigns/new">
            <Button size="sm">+ New campaign</Button>
          </Link>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>Campaign</Th>
              <Th>Segment</Th>
              <Th>Journey template</Th>
              <Th>Invitations</Th>
              <Th>Submitted</Th>
              <Th>Status</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const invitations = listInvitationsForCampaign(c.id);
              const linkedCases = cases.filter((k) => k.campaignId === c.id);
              const submitted = linkedCases.filter((k) =>
                ["submitted", "under_review", "info_requested", "verification_exception", "ready_for_handoff", "handed_off", "approved", "rejected", "closed"].includes(k.status)
              ).length;
              return (
                <TrClickable key={c.id} onClick={() => router.push(`/ops/invitations?campaign=${c.id}`)}>
                  <Td>{c.name}</Td>
                  <Td>{c.segment ?? "—"}</Td>
                  <Td>{c.journeyTemplate}</Td>
                  <Td className="tabular-nums">{invitations.length}</Td>
                  <Td className="tabular-nums">
                    {submitted} / {linkedCases.length}
                  </Td>
                  <Td>
                    <Badge tone={c.status === "active" ? "success" : c.status === "draft" ? "neutral" : "info"}>
                      {CAMPAIGN_STATUS_LABEL[c.status]}
                    </Badge>
                  </Td>
                  <Td>{c.createdAt}</Td>
                </TrClickable>
              );
            })}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-[13px] text-[var(--muted)]">
                  No campaigns yet — create one to start inviting applicants.
                </td>
              </tr>
            )}
          </tbody>
        </TableWrap>
        <span className="text-[13px] text-[var(--muted)]">Click a campaign to see its invitations.</span>
      </Panel>
    </DesktopFrame>
  );
}
