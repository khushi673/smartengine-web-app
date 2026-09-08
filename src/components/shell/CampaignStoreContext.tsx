"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import {
  Campaign,
  CampaignStatus,
  campaigns as seedCampaigns,
  Invitation,
  InvitationChannel,
  InvitationType,
  invitations as seedInvitations,
} from "@/lib/mock-data";
import { useCaseStore } from "./CaseStoreContext";

export interface NewCampaignInput {
  name: string;
  journeyTemplate: string;
  segment?: string;
}

export interface NewIndividualInvitationInput {
  campaignId: string;
  applicantName: string;
  contactName: string;
  email?: string;
  mobile?: string;
  channel: InvitationChannel;
  adcbReference?: string;
  segment?: string;
}

export interface BulkInvitationRow {
  adcbReference?: string;
  applicantName: string;
  contactName: string;
  email?: string;
  mobile?: string;
  channel: InvitationChannel;
  segment?: string;
}

interface CampaignStoreValue {
  listCampaigns: () => Campaign[];
  getCampaign: (id: string) => Campaign | undefined;
  createCampaign: (input: NewCampaignInput) => string;
  listInvitations: () => Invitation[];
  listInvitationsForCampaign: (campaignId: string) => Invitation[];
  createIndividualInvitation: (input: NewIndividualInvitationInput) => string;
  createBulkInvitations: (campaignId: string, rows: BulkInvitationRow[]) => string[];
  resendInvitation: (id: string) => void;
  cancelInvitation: (id: string) => void;
}

const CampaignStoreContext = createContext<CampaignStoreValue | null>(null);

function nowLabel() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function makeId(seed: string) {
  return `${seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
}

function sendInvitation(
  campaignId: string,
  type: InvitationType,
  data: Omit<BulkInvitationRow, "channel"> & { channel: InvitationChannel },
  addCase: (input: { business: string; campaignId: string; invitationId: string; segment?: string; adcbReference?: string }) => string
): Invitation {
  const id = makeId(`inv-${data.applicantName}`);
  const caseId = addCase({
    business: data.applicantName,
    campaignId,
    invitationId: id,
    segment: data.segment,
    adcbReference: data.adcbReference,
  });
  return {
    id,
    campaignId,
    type,
    applicantName: data.applicantName,
    contactName: data.contactName,
    email: data.email,
    mobile: data.mobile,
    channel: data.channel,
    adcbReference: data.adcbReference,
    segment: data.segment,
    status: "sent",
    caseId,
    sentAt: nowLabel(),
  };
}

export function CampaignStoreProvider({ children }: { children: ReactNode }) {
  const { addCase } = useCaseStore();
  const [campaignStore, setCampaignStore] = useState<Record<string, Campaign>>(() =>
    Object.fromEntries(seedCampaigns.map((c) => [c.id, c]))
  );
  const [invitationStore, setInvitationStore] = useState<Record<string, Invitation>>(() =>
    Object.fromEntries(seedInvitations.map((i) => [i.id, i]))
  );

  const createCampaign = useCallback((input: NewCampaignInput) => {
    const id = makeId(input.name);
    const campaign: Campaign = {
      id,
      name: input.name,
      journeyTemplate: input.journeyTemplate,
      segment: input.segment,
      createdAt: nowLabel(),
      status: "active" as CampaignStatus,
    };
    setCampaignStore((prev) => ({ ...prev, [id]: campaign }));
    return id;
  }, []);

  const createIndividualInvitation = useCallback(
    (input: NewIndividualInvitationInput) => {
      const invitation = sendInvitation(input.campaignId, "individual", input, addCase);
      setInvitationStore((prev) => ({ ...prev, [invitation.id]: invitation }));
      return invitation.id;
    },
    [addCase]
  );

  const createBulkInvitations = useCallback(
    (campaignId: string, rows: BulkInvitationRow[]) => {
      const created = rows.map((row) => sendInvitation(campaignId, "bulk", row, addCase));
      setInvitationStore((prev) => {
        const next = { ...prev };
        created.forEach((inv) => {
          next[inv.id] = inv;
        });
        return next;
      });
      return created.map((inv) => inv.id);
    },
    [addCase]
  );

  const resendInvitation = useCallback((id: string) => {
    setInvitationStore((prev) => {
      const inv = prev[id];
      if (!inv) return prev;
      return { ...prev, [id]: { ...inv, status: "sent", sentAt: nowLabel() } };
    });
  }, []);

  const cancelInvitation = useCallback((id: string) => {
    setInvitationStore((prev) => {
      const inv = prev[id];
      if (!inv) return prev;
      return { ...prev, [id]: { ...inv, status: "cancelled" } };
    });
  }, []);

  const value = useMemo<CampaignStoreValue>(
    () => ({
      listCampaigns: () => Object.values(campaignStore),
      getCampaign: (id: string) => campaignStore[id],
      createCampaign,
      listInvitations: () => Object.values(invitationStore),
      listInvitationsForCampaign: (campaignId: string) => Object.values(invitationStore).filter((i) => i.campaignId === campaignId),
      createIndividualInvitation,
      createBulkInvitations,
      resendInvitation,
      cancelInvitation,
    }),
    [campaignStore, invitationStore, createCampaign, createIndividualInvitation, createBulkInvitations, resendInvitation, cancelInvitation]
  );

  return <CampaignStoreContext.Provider value={value}>{children}</CampaignStoreContext.Provider>;
}

export function useCampaignStore() {
  const ctx = useContext(CampaignStoreContext);
  if (!ctx) throw new Error("useCampaignStore must be used within CampaignStoreProvider");
  return ctx;
}
