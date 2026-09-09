"use client";

import { ChangeEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DesktopFrame } from "@/components/ui/DeviceFrame";
import { Panel } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";
import { TableWrap, Th, Td } from "@/components/ui/Table";
import { InvitationStatusBadge } from "@/components/ui/Badge";
import { useCampaignStore, BulkInvitationRow } from "@/components/shell/CampaignStoreContext";
import { useToast } from "@/components/shell/ToastContext";
import { InvitationChannel } from "@/lib/mock-data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^\+?[0-9][0-9\s-]{7,}$/;

interface ParsedRow {
  adcbReference?: string;
  applicantName: string;
  contactName: string;
  email?: string;
  mobile?: string;
  channel: InvitationChannel;
  segment?: string;
  existingCustomer: boolean;
  valid: boolean;
  reasons: string[];
}

function parseBulkCsv(text: string, existingEmails: Set<string>, existingMobiles: Set<string>): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const [headerLine, ...dataLines] = lines;
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
  const seenEmails = new Set<string>();
  const seenMobiles = new Set<string>();

  return dataLines.map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const raw = Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""])) as Record<string, string>;
    const reasons: string[] = [];

    const applicantName = raw.company_name ?? "";
    const contactName = raw.contact_name ?? "";
    const email = raw.email || undefined;
    const mobile = raw.mobile || undefined;
    const segment = raw.segment || undefined;
    const adcbReference = raw.adcb_reference || undefined;
    const preferred = (raw.preferred_channel || "").toLowerCase();

    if (!applicantName) reasons.push("Missing applicant/company name");
    if (!contactName) reasons.push("Missing contact person name");
    if (!email && !mobile) reasons.push("At least one of email or mobile is required");
    if (email && !EMAIL_RE.test(email)) reasons.push("Invalid email format");
    if (mobile && !MOBILE_RE.test(mobile)) reasons.push("Invalid mobile format");
    if (email && seenEmails.has(email.toLowerCase())) reasons.push("Duplicate email in this file");
    if (mobile && seenMobiles.has(mobile)) reasons.push("Duplicate mobile in this file");
    if (email && existingEmails.has(email.toLowerCase())) reasons.push("Existing active invitation for this email");
    if (mobile && existingMobiles.has(mobile)) reasons.push("Existing active invitation for this mobile");

    if (email) seenEmails.add(email.toLowerCase());
    if (mobile) seenMobiles.add(mobile);

    let channel: InvitationChannel = "email";
    if (preferred === "email" || preferred === "sms" || preferred === "both") {
      channel = preferred as InvitationChannel;
    } else if (email && mobile) {
      channel = "both";
    } else if (mobile) {
      channel = "sms";
    }

    const existingCustomer = (segment ?? "").toLowerCase().includes("existing");

    return { adcbReference, applicantName, contactName, email, mobile, channel, segment, existingCustomer, valid: reasons.length === 0, reasons };
  });
}

function downloadErrorReport(rows: ParsedRow[]) {
  const invalid = rows.filter((r) => !r.valid);
  const header = "adcb_reference,company_name,contact_name,email,mobile,preferred_channel,segment,reasons\n";
  const body = invalid
    .map((r) =>
      [r.adcbReference ?? "", r.applicantName, r.contactName, r.email ?? "", r.mobile ?? "", r.channel, r.segment ?? "", r.reasons.join(" | ")]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([header + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "invitation-errors.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function InvitationsPage() {
  return (
    <Suspense fallback={null}>
      <InvitationsPageInner />
    </Suspense>
  );
}

function InvitationsPageInner() {
  const searchParams = useSearchParams();
  const { listCampaigns, createIndividualInvitation, createBulkInvitations, listInvitations } = useCampaignStore();
  const { showToast } = useToast();
  const campaigns = listCampaigns();
  const preselected = searchParams.get("campaign") ?? campaigns[0]?.id ?? "";

  return (
    <DesktopFrame>
      <Panel className="flex flex-col gap-4 p-4.5">
        <div>
          <h2 className="text-[19px]">Invitations</h2>
          <span className="text-[13px] text-[var(--muted)]">Send, monitor, and track individual and bulk invitations.</span>
        </div>

        <Tabs
          items={[
            { key: "individual", label: "Individual", content: <IndividualTab campaigns={campaigns} preselected={preselected} onSent={() => showToast("Invitation sent.", "success")} /> },
            { key: "bulk", label: "Bulk Upload", content: <BulkTab campaigns={campaigns} preselected={preselected} createBulkInvitations={createBulkInvitations} showToast={showToast} /> },
          ]}
        />

        <hr className="border-[var(--border)]" />
        <RecentInvitations invitations={listInvitations()} campaigns={campaigns} />
      </Panel>
    </DesktopFrame>
  );

  function IndividualTab({
    campaigns,
    preselected,
    onSent,
  }: {
    campaigns: ReturnType<typeof listCampaigns>;
    preselected: string;
    onSent: () => void;
  }) {
    const [campaignId, setCampaignId] = useState(preselected);
    const [applicantName, setApplicantName] = useState("");
    const [contactName, setContactName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [channel, setChannel] = useState<InvitationChannel>("email");
    const [adcbReference, setAdcbReference] = useState("");
    const [segment, setSegment] = useState("");
    const [existingCustomer, setExistingCustomer] = useState(false);

    const canSend = campaignId && applicantName.trim() && contactName.trim() && (email.trim() || mobile.trim());

    const send = () => {
      if (!canSend) return;
      createIndividualInvitation({
        campaignId,
        applicantName: applicantName.trim(),
        contactName: contactName.trim(),
        email: email.trim() || undefined,
        mobile: mobile.trim() || undefined,
        channel,
        adcbReference: adcbReference.trim() || undefined,
        segment: segment.trim() || undefined,
        existingCustomer,
      });
      onSent();
      setApplicantName("");
      setContactName("");
      setEmail("");
      setMobile("");
      setAdcbReference("");
      setSegment("");
      setExistingCustomer(false);
    };

    return (
      <div className="flex flex-col gap-3.5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Campaign">
            <Select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
              {campaigns.length === 0 && <option value="">No campaigns yet</option>}
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Onboarding journey">
            <Select defaultValue="Standard merchant onboarding">
              <option value="Standard merchant onboarding">Standard merchant onboarding</option>
              <option value="Fleet card onboarding">Fleet card onboarding</option>
            </Select>
          </Field>
          <Field label="Applicant / company name">
            <Input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} placeholder="e.g. Coral Bay Trading LLC" />
          </Field>
          <Field label="Contact person name">
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. Amina Rashid" />
          </Field>
          <Field label="Email address">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.ae" />
          </Field>
          <Field label="Mobile number">
            <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+971 5X XXX XXXX" />
          </Field>
          <Field label="Preferred channel">
            <Select value={channel} onChange={(e) => setChannel(e.target.value as InvitationChannel)}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Both</option>
            </Select>
          </Field>
          <Field label="External ADCB reference" hint="Optional">
            <Input value={adcbReference} onChange={(e) => setAdcbReference(e.target.value)} />
          </Field>
          <Field label="Segment / category" hint="Optional">
            <Input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="e.g. SME" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[var(--ink)]">
          <input
            type="checkbox"
            checked={existingCustomer}
            onChange={(e) => setExistingCustomer(e.target.checked)}
            className="accent-[var(--brand)]"
          />
          This is an existing bank customer — pre-fill their application from our records
        </label>
        <div className="flex justify-end">
          <Button onClick={send} disabled={!canSend}>
            Review and send invitation
          </Button>
        </div>
      </div>
    );
  }

  function BulkTab({
    campaigns,
    preselected,
    createBulkInvitations,
    showToast,
  }: {
    campaigns: ReturnType<typeof listCampaigns>;
    preselected: string;
    createBulkInvitations: (campaignId: string, rows: BulkInvitationRow[]) => string[];
    showToast: (message: string, tone?: "default" | "success" | "warning") => void;
  }) {
    const { listInvitations } = useCampaignStore();
    const [campaignId, setCampaignId] = useState(preselected);
    const [fileName, setFileName] = useState<string | null>(null);
    const [rows, setRows] = useState<ParsedRow[] | null>(null);

    const summary = useMemo(() => {
      if (!rows) return null;
      const valid = rows.filter((r) => r.valid);
      const invalid = rows.filter((r) => !r.valid);
      return {
        total: rows.length,
        valid: valid.length,
        invalid: invalid.length,
        byChannel: {
          email: valid.filter((r) => r.channel === "email").length,
          sms: valid.filter((r) => r.channel === "sms").length,
          both: valid.filter((r) => r.channel === "both").length,
        },
      };
    }, [rows]);

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      file.text().then((text) => {
        const active = listInvitations().filter((i) => i.status !== "cancelled" && i.status !== "expired");
        const existingEmails = new Set(active.map((i) => i.email?.toLowerCase()).filter(Boolean) as string[]);
        const existingMobiles = new Set(active.map((i) => i.mobile).filter(Boolean) as string[]);
        setRows(parseBulkCsv(text, existingEmails, existingMobiles));
      });
    };

    const confirmSend = () => {
      if (!rows || !campaignId) return;
      const valid = rows.filter((r) => r.valid);
      createBulkInvitations(
        campaignId,
        valid.map((r) => ({
          adcbReference: r.adcbReference,
          applicantName: r.applicantName,
          contactName: r.contactName,
          email: r.email,
          mobile: r.mobile,
          channel: r.channel,
          segment: r.segment,
          existingCustomer: r.existingCustomer,
        }))
      );
      showToast(`${valid.length} invitation${valid.length === 1 ? "" : "s"} sent.`, "success");
      setRows(null);
      setFileName(null);
    };

    return (
      <div className="flex flex-col gap-3.5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Campaign">
            <Select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
              {campaigns.length === 0 && <option value="">No campaigns yet</option>}
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Onboarding journey">
            <Select defaultValue="Standard merchant onboarding">
              <option value="Standard merchant onboarding">Standard merchant onboarding</option>
              <option value="Fleet card onboarding">Fleet card onboarding</option>
            </Select>
          </Field>
        </div>

        <Field label="Recipient list">
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center rounded-md border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-[12.5px] font-bold text-[var(--ink)] hover:bg-[var(--surface)]">
              {fileName ?? "Choose CSV file"}
              <input type="file" accept=".csv" className="hidden" onChange={onFileChange} />
            </label>
            <a href="/sample-merchant-campaign.csv" download className="text-[12px] font-bold text-[var(--brand)]">
              Download template
            </a>
          </div>
        </Field>

        {summary && rows && (
          <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{summary.total} rows uploaded</Badge>
              <Badge tone="success">{summary.valid} valid</Badge>
              {summary.invalid > 0 && <Badge tone="warning">{summary.invalid} excluded</Badge>}
              <Badge tone="info">{summary.byChannel.email} email</Badge>
              <Badge tone="info">{summary.byChannel.sms} SMS</Badge>
              <Badge tone="info">{summary.byChannel.both} both</Badge>
            </div>

            <TableWrap>
              <thead>
                <tr>
                  <Th>Company</Th>
                  <Th>Contact</Th>
                  <Th>Email / Mobile</Th>
                  <Th>Channel</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={r.valid ? "" : "bg-[var(--warning-bg)]"}>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <span>{r.applicantName || "—"}</span>
                        {r.existingCustomer && <Badge tone="info">Existing customer</Badge>}
                      </div>
                    </Td>
                    <Td>{r.contactName || "—"}</Td>
                    <Td>{[r.email, r.mobile].filter(Boolean).join(" · ") || "—"}</Td>
                    <Td>{r.channel}</Td>
                    <Td>
                      {r.valid ? (
                        <Badge tone="success">Ready</Badge>
                      ) : (
                        <span className="flex flex-col gap-0.5">
                          <Badge tone="warning">Excluded</Badge>
                          <span className="text-[11px] text-[var(--warning-text)]">{r.reasons.join("; ")}</span>
                        </span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>

            <div className="flex justify-between gap-2">
              {summary.invalid > 0 && (
                <Button variant="secondary" size="sm" onClick={() => downloadErrorReport(rows)}>
                  Download error report
                </Button>
              )}
              <div className="flex-1" />
              <Button size="sm" onClick={confirmSend} disabled={summary.valid === 0 || !campaignId}>
                Send to {summary.valid} valid recipient{summary.valid === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

function RecentInvitations({
  invitations,
  campaigns,
}: {
  invitations: ReturnType<ReturnType<typeof useCampaignStore>["listInvitations"]>;
  campaigns: ReturnType<ReturnType<typeof useCampaignStore>["listCampaigns"]>;
}) {
  const campaignName = (id: string) => campaigns.find((c) => c.id === id)?.name ?? "—";
  const sorted = [...invitations].sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));

  return (
    <div className="flex flex-col gap-2.5">
      <strong className="text-[13px]">Recent invitations</strong>
      <TableWrap>
        <thead>
          <tr>
            <Th>Applicant / company</Th>
            <Th>Campaign</Th>
            <Th>Type</Th>
            <Th>Channel</Th>
            <Th>Status</Th>
            <Th>Sent</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((i) => (
            <tr key={i.id}>
              <Td>{i.applicantName}</Td>
              <Td>{campaignName(i.campaignId)}</Td>
              <Td className="capitalize">{i.type}</Td>
              <Td className="capitalize">{i.channel}</Td>
              <Td>
                <InvitationStatusBadge status={i.status} />
              </Td>
              <Td>{i.sentAt}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
