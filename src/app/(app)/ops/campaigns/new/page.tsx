"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DesktopFrame } from "@/components/ui/DeviceFrame";
import { Panel } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { useCampaignStore } from "@/components/shell/CampaignStoreContext";
import { useToast } from "@/components/shell/ToastContext";

export default function NewCampaignPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { createCampaign } = useCampaignStore();
  const [name, setName] = useState("");
  const [journeyTemplate, setJourneyTemplate] = useState("Standard merchant onboarding");
  const [segment, setSegment] = useState("");

  const canCreate = name.trim().length > 0;

  const submit = () => {
    if (!canCreate) return;
    createCampaign({ name: name.trim(), journeyTemplate, segment: segment.trim() || undefined });
    showToast(`"${name.trim()}" campaign created.`, "success");
    router.push("/ops/campaigns");
  };

  return (
    <DesktopFrame>
      <div className="mx-auto flex max-w-140 flex-col gap-5">
        <div>
          <h2 className="text-[19px]">New campaign</h2>
          <span className="text-[13px] text-[var(--muted)]">
            Campaign, invitation type, and segment are tracked separately — individual and bulk invitations are added afterward from the
            Invitations module.
          </span>
        </div>

        <Panel className="flex flex-col gap-3.5 p-4.5">
          <Field label="Campaign name" hint="The business purpose or initiative this campaign represents.">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SME Merchant Onboarding – September 2026"
            />
          </Field>
          <Field label="Onboarding journey">
            <Select value={journeyTemplate} onChange={(e) => setJourneyTemplate(e.target.value)}>
              <option value="Standard merchant onboarding">Standard merchant onboarding</option>
              <option value="Fleet card onboarding">Fleet card onboarding</option>
            </Select>
          </Field>
          <Field label="Segment / category" hint="Optional — SME, F&B, existing customer, corporate, etc.">
            <Input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="e.g. SME" />
          </Field>
        </Panel>

        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={() => router.push("/ops/campaigns")}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canCreate}>
            Create campaign
          </Button>
        </div>
      </div>
    </DesktopFrame>
  );
}
