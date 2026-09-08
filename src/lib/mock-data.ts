// Dummy data for the SmartEngine demo interface.
// Shape mirrors what the real API is expected to return post-Phase-2 —
// swap these exports for fetch calls without touching page components.

export type VerificationState =
  | "verified"
  | "matched"
  | "partially_matched"
  | "mismatch"
  | "unable_to_verify"
  | "bank_review_required"
  | "pending"
  | "integration_unavailable";

export type CaseStatus =
  | "invited"
  | "in_progress"
  | "submitted"
  | "info_requested"
  | "verification_exception"
  | "under_review"
  | "ready_for_handoff"
  | "handed_off"
  | "approved"
  | "rejected"
  | "closed";

export interface VerificationCheck {
  field: string;
  applicantEntered: string;
  extracted: string;
  state: VerificationState;
  source: string;
}

export interface CaseDocument {
  name: string;
  kind: string;
  version: number;
  quality: "passed" | "attention_required";
}

export type TimelineEventKind =
  | "status"
  | "document"
  | "note"
  | "signatory"
  | "verification"
  | "handoff"
  | "consent";

export interface TimelineEvent {
  label: string;
  actor: string;
  timestamp: string;
  tone?: "default" | "warning" | "success";
  kind?: TimelineEventKind;
  detail?: string;
}

export interface Case {
  id: string;
  ref: string;
  business: string;
  structure: string;
  tradeLicenceNo: string;
  emirate: string;
  signatoryName: string;
  signatoryRole: string;
  signatoryEmail: string;
  signatoryPhone: string;
  status: CaseStatus;
  ageHours: number;
  assignee: string | null;
  existingCustomer: boolean;
  verification: VerificationCheck[];
  documents: CaseDocument[];
  timeline: TimelineEvent[];
  campaignId?: string;
  segment?: string;
  adcbReference?: string;
  invitationId?: string;
}

export const CASE_STATUS_LABEL: Record<CaseStatus, string> = {
  invited: "Invited",
  in_progress: "In Progress",
  submitted: "Submitted",
  info_requested: "Requires Information",
  verification_exception: "Verification Exception",
  under_review: "Ready for Review",
  ready_for_handoff: "Ready for Handoff",
  handed_off: "Handed Off",
  approved: "Approved",
  rejected: "Rejected",
  closed: "Closed",
};

export const VERIFICATION_LABEL: Record<VerificationState, string> = {
  verified: "Verified",
  matched: "Matched",
  partially_matched: "Partially matched",
  mismatch: "Mismatch detected",
  unable_to_verify: "Unable to verify",
  bank_review_required: "Bank review required",
  pending: "Verification pending",
  integration_unavailable: "Integration unavailable",
};

export const cases: Case[] = [
  {
    id: "alnoor",
    ref: "SE-2026-081402",
    business: "Al Noor Trading LLC",
    structure: "LLC",
    tradeLicenceNo: "774521",
    emirate: "Dubai",
    signatoryName: "Fatima Al Suwaidi",
    signatoryRole: "General Manager (POA)",
    signatoryEmail: "fatima@alnoortrading.ae",
    signatoryPhone: "+971 50 123 4567",
    status: "under_review",
    ageHours: 24,
    assignee: "S. Khan",
    existingCustomer: true,
    campaignId: "sme-sep-2026",
    segment: "SME",
    adcbReference: "ADCB-REF-10234",
    invitationId: "inv-alnoor",
    verification: [
      { field: "Licence expiry", applicantEntered: "12 Mar 2027", extracted: "12 Mar 2027", state: "verified", source: "Authority registry" },
      { field: "Emirates ID expiry", applicantEntered: "04 Jun 2028", extracted: "04 Jun 2027", state: "mismatch", source: "Third-party provider" },
      { field: "Legal name", applicantEntered: "Al Noor Trading LLC", extracted: "Al Noor Trading LLC", state: "matched", source: "Authority registry" },
      { field: "VAT registration", applicantEntered: "Not provided", extracted: "—", state: "bank_review_required", source: "Bank verification layer" },
    ],
    documents: [
      { name: "Trade licence", kind: "trade_licence", version: 1, quality: "passed" },
      { name: "Emirates ID", kind: "emirates_id", version: 1, quality: "passed" },
    ],
    timeline: [
      { label: "Application submitted", actor: "Applicant", timestamp: "14 Aug 2026, 10:42" },
      { label: "Verification routed — Trade licence", actor: "Authority registry", timestamp: "14 Aug 2026, 10:43" },
      { label: "Mismatch flagged — Emirates ID expiry", actor: "SmartEngine", timestamp: "14 Aug 2026, 10:44", tone: "warning" },
      { label: "Assigned to S. Khan", actor: "Operations", timestamp: "14 Aug 2026, 11:02" },
    ],
  },
  {
    id: "zenith",
    ref: "SE-2026-081187",
    business: "Zenith Auto Spares",
    structure: "LLC",
    tradeLicenceNo: "651920",
    emirate: "Sharjah",
    signatoryName: "Omar Haddad",
    signatoryRole: "Owner",
    signatoryEmail: "omar@zenithauto.ae",
    signatoryPhone: "+971 55 987 6543",
    status: "info_requested",
    ageHours: 96,
    assignee: null,
    existingCustomer: false,
    campaignId: "existing-pos",
    segment: "Existing customer",
    invitationId: "inv-zenith",
    verification: [
      { field: "Licence expiry", applicantEntered: "09 Jan 2026", extracted: "—", state: "unable_to_verify", source: "Authority registry" },
      { field: "Emirates ID expiry", applicantEntered: "21 Nov 2029", extracted: "21 Nov 2029", state: "verified", source: "Third-party provider" },
      { field: "Legal name", applicantEntered: "Zenith Auto Spares", extracted: "Zenith Auto Spares LLC", state: "partially_matched", source: "Authority registry" },
    ],
    documents: [
      { name: "Trade licence", kind: "trade_licence", version: 2, quality: "attention_required" },
      { name: "Emirates ID", kind: "emirates_id", version: 1, quality: "passed" },
    ],
    timeline: [
      { label: "Application submitted", actor: "Applicant", timestamp: "10 Aug 2026, 09:15" },
      { label: "Trade licence unreadable — replacement requested", actor: "SmartEngine", timestamp: "10 Aug 2026, 09:16", tone: "warning" },
      { label: "Information request sent", actor: "Operations", timestamp: "11 Aug 2026, 14:30" },
    ],
  },
  {
    id: "gulf",
    ref: "SE-2026-080954",
    business: "Gulf Fresh Mart LLC",
    structure: "LLC",
    tradeLicenceNo: "512877",
    emirate: "Abu Dhabi",
    signatoryName: "Aisha Al Mazrouei",
    signatoryRole: "General Manager (POA)",
    signatoryEmail: "aisha@gulffreshmart.ae",
    signatoryPhone: "+971 52 445 1120",
    status: "ready_for_handoff",
    ageHours: 48,
    assignee: "R. Osei",
    existingCustomer: true,
    campaignId: "sme-sep-2026",
    segment: "SME",
    adcbReference: "ADCB-REF-10871",
    invitationId: "inv-gulf",
    verification: [
      { field: "Licence expiry", applicantEntered: "30 Sep 2027", extracted: "30 Sep 2027", state: "verified", source: "Authority registry" },
      { field: "Emirates ID expiry", applicantEntered: "15 Feb 2030", extracted: "15 Feb 2030", state: "verified", source: "Third-party provider" },
      { field: "Legal name", applicantEntered: "Gulf Fresh Mart LLC", extracted: "Gulf Fresh Mart LLC", state: "matched", source: "Authority registry" },
    ],
    documents: [
      { name: "Trade licence", kind: "trade_licence", version: 1, quality: "passed" },
      { name: "Emirates ID", kind: "emirates_id", version: 1, quality: "passed" },
    ],
    timeline: [
      { label: "Application submitted", actor: "Applicant", timestamp: "12 Aug 2026, 08:02" },
      { label: "All checks verified", actor: "SmartEngine", timestamp: "12 Aug 2026, 08:05", tone: "success" },
      { label: "Marked ready for handoff", actor: "R. Osei", timestamp: "13 Aug 2026, 16:40", tone: "success" },
    ],
  },
  {
    id: "coastal",
    ref: "SE-2026-080811",
    business: "Coastal Traders FZE",
    structure: "Branch (foreign entity)",
    tradeLicenceNo: "203348",
    emirate: "Dubai",
    signatoryName: "Michael Tan",
    signatoryRole: "Delegated representative",
    signatoryEmail: "michael@coastaltraders.com",
    signatoryPhone: "+971 56 210 9987",
    status: "submitted",
    ageHours: 6,
    assignee: "S. Khan",
    existingCustomer: false,
    campaignId: "fnb-migration",
    segment: "F&B",
    invitationId: "inv-coastal",
    verification: [
      { field: "Licence expiry", applicantEntered: "18 Jul 2027", extracted: "18 Jul 2027", state: "pending", source: "Authority registry" },
      { field: "Emirates ID expiry", applicantEntered: "02 Oct 2028", extracted: "02 Oct 2028", state: "pending", source: "Third-party provider" },
    ],
    documents: [
      { name: "Trade licence", kind: "trade_licence", version: 1, quality: "passed" },
    ],
    timeline: [
      { label: "Application submitted", actor: "Applicant", timestamp: "14 Aug 2026, 15:20", kind: "status" },
      { label: "Verification routed", actor: "SmartEngine", timestamp: "14 Aug 2026, 15:21", kind: "verification" },
    ],
  },
  {
    id: "falcon",
    ref: "SE-2026-081512",
    business: "Falcon Wing Logistics FZE",
    structure: "",
    tradeLicenceNo: "",
    emirate: "Dubai",
    signatoryName: "",
    signatoryRole: "",
    signatoryEmail: "",
    signatoryPhone: "",
    status: "invited",
    ageHours: 216,
    assignee: null,
    existingCustomer: false,
    campaignId: "existing-pos",
    segment: "Existing customer",
    adcbReference: "ADCB-REF-11290",
    invitationId: "inv-falcon",
    verification: [],
    documents: [],
    timeline: [
      { label: "Invitation sent", actor: "Operations", timestamp: "05 Sep 2026, 09:10", kind: "status" },
    ],
  },
  {
    id: "palmridge",
    ref: "SE-2026-081538",
    business: "Palm Ridge Electronics Trading",
    structure: "LLC",
    tradeLicenceNo: "",
    emirate: "Dubai",
    signatoryName: "",
    signatoryRole: "",
    signatoryEmail: "",
    signatoryPhone: "",
    status: "in_progress",
    ageHours: 18,
    assignee: null,
    existingCustomer: false,
    campaignId: "sme-sep-2026",
    segment: "SME",
    invitationId: "inv-palmridge",
    verification: [],
    documents: [],
    timeline: [
      { label: "Invitation sent", actor: "Operations", timestamp: "06 Sep 2026, 13:00", kind: "status" },
      { label: "Invitation link opened", actor: "Applicant", timestamp: "06 Sep 2026, 15:22", kind: "status" },
    ],
  },
];

export const getCase = (id: string) => cases.find((c) => c.id === id);

export const dashboardMetrics = {
  invited: 1204,
  invitedDelta: "▲ 86 this week",
  opened: 918,
  openedDelta: "▲ 61 this week",
  submitted: 642,
  submittedDelta: "▲ 34 this week",
  infoRequested: 57,
  infoRequestedDelta: "needs follow-up",
  readyForHandoff: 301,
  readyForHandoffDelta: "▲ 22 this week",
  handedOff: 288,
  handedOffDelta: "▲ 19 this week",
  nonResponders: [
    { business: "Gulf Fresh Mart LLC", invitedDaysAgo: 11 },
    { business: "Zenith Auto Spares", invitedDaysAgo: 9 },
  ],
  exceptions: [
    { label: "Mismatch detected", count: 14, tone: "warning" as const },
    { label: "Unable to verify", count: 5, tone: "danger" as const },
    { label: "Integration unavailable", count: 2, tone: "neutral" as const },
    { label: "SLA breached (>3d)", count: 8, tone: "danger" as const },
  ],
};

export interface VerificationRoute {
  check: string;
  route: "Direct authority" | "Third-party provider" | "Bank verification layer" | "Not configured";
  provider: string;
  status: "active" | "bank_owned" | "sandbox";
}

export const verificationRoutes: VerificationRoute[] = [
  { check: "Trade licence", route: "Direct authority", provider: "DED Registry (UAE)", status: "active" },
  { check: "Emirates ID", route: "Third-party provider", provider: "Provider A (identity)", status: "active" },
  { check: "AML / sanctions screening", route: "Bank verification layer", provider: "Meridian Bank — internal", status: "bank_owned" },
  { check: "VAT certificate", route: "Not configured", provider: "—", status: "sandbox" },
];

export interface Tenant {
  name: string;
  programme: string;
  domain: string;
  status: "active" | "provisioning";
  connectorsEnabled: number;
  connectorsTotal: number;
}

export const tenants: Tenant[] = [
  { name: "Meridian Bank", programme: "Commercial card onboarding", domain: "apply.meridianbank.ae", status: "active", connectorsEnabled: 3, connectorsTotal: 6 },
  { name: "Al Waha Bank", programme: "Fleet card onboarding", domain: "Not configured", status: "provisioning", connectorsEnabled: 1, connectorsTotal: 6 },
];

export interface Connector {
  name: string;
  category: string;
  tenantsUsing: number;
  availability: "available" | "framework_only";
  description: string;
}

export const connectors: Connector[] = [
  {
    name: "DED Registry (UAE)",
    category: "Verification & identity",
    tenantsUsing: 2,
    availability: "available",
    description: "Direct authority connector for trade licence lookup and status verification against the Department of Economic Development registry.",
  },
  {
    name: "Provider A — identity",
    category: "Verification & identity",
    tenantsUsing: 1,
    availability: "available",
    description: "Approved third-party KYC/identity provider used for Emirates ID and passport verification where direct authority access is not configured.",
  },
  {
    name: "Payment/acquiring adapter",
    category: "Payment / merchant services",
    tenantsUsing: 0,
    availability: "framework_only",
    description: "Admin-ready connector framework for merchant payment/acquiring services. Live integrations are scoped and approved separately per tenant.",
  },
  {
    name: "Email sender",
    category: "Communications",
    tenantsUsing: 2,
    availability: "available",
    description: "Baseline notification channel for invitations, information requests and status updates. SMS/WhatsApp adapters are ready for Phase 2.",
  },
];

export interface BankUser {
  name: string;
  role: string;
  email: string;
  status: "active" | "invited";
}

export const bankUsers: BankUser[] = [
  { name: "Sara Khan", role: "Operations manager", email: "sara.khan@meridianbank.ae", status: "active" },
  { name: "Ravi Osei", role: "Operations officer", email: "ravi.osei@meridianbank.ae", status: "active" },
  { name: "Fatima Al Zaabi", role: "Tenant administrator", email: "fatima.alzaabi@meridianbank.ae", status: "active" },
  { name: "James Whitfield", role: "Operations officer", email: "james.whitfield@meridianbank.ae", status: "invited" },
];

// ---- Campaigns & invitations ----
// A campaign is the named business initiative an invitation belongs to; invitation
// type (individual/bulk) and segment/category are tracked as separate fields per the
// bank's requirement, never folded into the campaign name itself.

export type CampaignStatus = "draft" | "active" | "closed";

export interface Campaign {
  id: string;
  name: string;
  journeyTemplate: string;
  segment?: string;
  createdAt: string;
  status: CampaignStatus;
}

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  closed: "Closed",
};

export const campaigns: Campaign[] = [
  {
    id: "sme-sep-2026",
    name: "SME Merchant Onboarding – September 2026",
    journeyTemplate: "Standard merchant onboarding",
    segment: "SME",
    createdAt: "01 Sep 2026",
    status: "active",
  },
  {
    id: "existing-pos",
    name: "Existing POS Merchants",
    journeyTemplate: "Fleet card onboarding",
    segment: "Existing customer",
    createdAt: "18 Aug 2026",
    status: "active",
  },
  {
    id: "fnb-migration",
    name: "F&B Merchant Migration",
    journeyTemplate: "Standard merchant onboarding",
    segment: "F&B",
    createdAt: "05 Aug 2026",
    status: "closed",
  },
];

export const getCampaign = (id: string) => campaigns.find((c) => c.id === id);

export type InvitationType = "individual" | "bulk";
export type InvitationChannel = "email" | "sms" | "both";
export type InvitationStatus = "sent" | "delivered" | "failed" | "opened" | "expired" | "cancelled";

export const INVITATION_STATUS_LABEL: Record<InvitationStatus, string> = {
  sent: "Sent",
  delivered: "Delivered",
  failed: "Failed",
  opened: "Opened",
  expired: "Expired",
  cancelled: "Cancelled",
};

export interface Invitation {
  id: string;
  campaignId: string;
  type: InvitationType;
  applicantName: string;
  contactName: string;
  email?: string;
  mobile?: string;
  channel: InvitationChannel;
  adcbReference?: string;
  segment?: string;
  status: InvitationStatus;
  caseId: string;
  sentAt: string;
}

export const invitations: Invitation[] = [
  {
    id: "inv-alnoor",
    campaignId: "sme-sep-2026",
    type: "individual",
    applicantName: "Al Noor Trading LLC",
    contactName: "Fatima Al Suwaidi",
    email: "fatima@alnoortrading.ae",
    mobile: "+971 50 123 4567",
    channel: "both",
    adcbReference: "ADCB-REF-10234",
    segment: "SME",
    status: "opened",
    caseId: "alnoor",
    sentAt: "14 Aug 2026, 09:30",
  },
  {
    id: "inv-zenith",
    campaignId: "existing-pos",
    type: "individual",
    applicantName: "Zenith Auto Spares",
    contactName: "Omar Haddad",
    email: "omar@zenithauto.ae",
    channel: "email",
    segment: "Existing customer",
    status: "opened",
    caseId: "zenith",
    sentAt: "10 Aug 2026, 08:50",
  },
  {
    id: "inv-gulf",
    campaignId: "sme-sep-2026",
    type: "bulk",
    applicantName: "Gulf Fresh Mart LLC",
    contactName: "Aisha Al Mazrouei",
    mobile: "+971 52 445 1120",
    channel: "sms",
    adcbReference: "ADCB-REF-10871",
    segment: "SME",
    status: "opened",
    caseId: "gulf",
    sentAt: "12 Aug 2026, 07:40",
  },
  {
    id: "inv-coastal",
    campaignId: "fnb-migration",
    type: "individual",
    applicantName: "Coastal Traders FZE",
    contactName: "Michael Tan",
    email: "michael@coastaltraders.com",
    channel: "email",
    segment: "F&B",
    status: "opened",
    caseId: "coastal",
    sentAt: "14 Aug 2026, 14:55",
  },
  {
    id: "inv-falcon",
    campaignId: "existing-pos",
    type: "bulk",
    applicantName: "Falcon Wing Logistics FZE",
    contactName: "Tariq Al Nuaimi",
    email: "tariq.alnuaimi@falconwinglogistics.com",
    mobile: "+971 56 890 1123",
    channel: "both",
    adcbReference: "ADCB-REF-11290",
    segment: "Existing customer",
    status: "sent",
    caseId: "falcon",
    sentAt: "05 Sep 2026, 09:10",
  },
  {
    id: "inv-palmridge",
    campaignId: "sme-sep-2026",
    type: "individual",
    applicantName: "Palm Ridge Electronics Trading",
    contactName: "Reem Al Falasi",
    email: "reem.alfalasi@palmridgeelec.ae",
    channel: "email",
    segment: "SME",
    status: "opened",
    caseId: "palmridge",
    sentAt: "06 Sep 2026, 13:00",
  },
];

export const listInvitationsForCampaign = (campaignId: string) =>
  invitations.filter((i) => i.campaignId === campaignId);
