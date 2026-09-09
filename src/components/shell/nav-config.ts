export const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/overview", title: "End-to-end workflow" }],
  },
  {
    label: "Applicant",
    items: [
      { href: "/applicant", title: "Invitation landing" },
      { href: "/applicant/identity", title: "New or existing customer" },
      { href: "/applicant/consent", title: "Consent & privacy notice" },
      { href: "/applicant/documents", title: "Document upload" },
      { href: "/applicant/processing", title: "AI Processing & Extraction" },
      { href: "/applicant/business", title: "Business details" },
      { href: "/applicant/signatory", title: "Signatory details" },
      { href: "/applicant/review", title: "Review & final declaration" },
      { href: "/applicant/confirmation", title: "Submission confirmation" },
      { href: "/applicant/resubmission", title: "Information request (resubmission)" },
    ],
  },
  {
    label: "Bank Operations",
    items: [
      { href: "/ops", title: "Operations dashboard" },
      { href: "/ops/campaigns", title: "Campaigns" },
      { href: "/ops/invitations", title: "Invitations" },
      { href: "/ops/non-responders", title: "Non-responders" },
      { href: "/ops/queue", title: "Case queue" },
    ],
  },
  {
    label: "Bank Admin",
    items: [
      { href: "/admin", title: "Admin dashboard" },
      { href: "/admin/branding", title: "Branding & content" },
      { href: "/admin/verification", title: "Verification & integrations" },
    ],
  },
  {
    label: "Oblavo Admin",
    items: [
      { href: "/platform", title: "Platform dashboard" },
      { href: "/platform/tenants", title: "Tenants" },
    ],
  },
] as const;
