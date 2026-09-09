"use client";

import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Field, Input, Select } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";
import { useApplicantDraft, SignatoryDraft } from "@/components/shell/ApplicantDraftContext";
import { DocumentScanner } from "@/components/applicant/DocumentScanner";

function isComplete(s: SignatoryDraft) {
  return s.idUpload === "good" && s.name.trim().length > 0 && s.idNumber.trim().length > 0 && s.mobile.trim().length > 0 && s.email.trim().length > 0;
}

export default function SignatoryDetailsPage() {
  const { tenant } = useTenantTheme();
  const router = useRouter();
  const { signatories, addSignatory, updateSignatory, removeSignatory, setSignatoryUpload, isExistingCustomer } = useApplicantDraft();

  const idCounts = signatories.reduce<Record<string, number>>((acc, s) => {
    if (s.idNumber.trim()) acc[s.idNumber.trim()] = (acc[s.idNumber.trim()] ?? 0) + 1;
    return acc;
  }, {});

  const allComplete = signatories.length > 0 && signatories.every(isComplete);
  const totalSteps = isExistingCustomer ? 3 : 6;
  const stepNum = isExistingCustomer ? 2 : 5;

  return (
    <PhoneFrame tenant={tenant}>
      <div className="flex flex-col gap-1">
        <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">
          Step {stepNum} of {totalSteps} · Signatory details
        </span>
        <h1 className="text-[19px]">Who is authorised to sign?</h1>
      </div>
      <ProgressSteps total={totalSteps} current={stepNum} />

      <p className="text-[12.5px] text-[var(--t-muted,var(--muted))]">
        Add every authorised signatory. Each uploads their own ID — details are extracted and reviewed individually and never mixed
        between signatories.
      </p>

      {signatories.map((s, i) => {
        const duplicate = s.idNumber.trim() && idCounts[s.idNumber.trim()] > 1;
        return (
          <Card key={s.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <strong className="text-[13px] text-[var(--t-ink-strong,var(--ink-strong))]">Signatory {i + 1}</strong>
                {isComplete(s) ? <Badge tone="success">Complete</Badge> : <Badge tone="warning">Incomplete</Badge>}
                {duplicate && <Badge tone="danger">Possible duplicate ID</Badge>}
              </div>
              {signatories.length > 1 && (
                <button
                  className="text-[12px] font-bold text-[var(--danger-text)]"
                  onClick={() => removeSignatory(s.id)}
                >
                  Remove
                </button>
              )}
            </div>

            <DocumentScanner
              fileLabel={`signatory_${i + 1}_id.jpg`}
              status={s.idUpload}
              onResult={(kind) => setSignatoryUpload(s.id, kind)}
              onReset={() => setSignatoryUpload(s.id, "idle")}
              extractedChips={s.idUpload === "good" ? ["Name matched", `ID ${s.idNumber || "—"}`] : undefined}
            />

            <Field label="Signatory name">
              <Input value={s.name} onChange={(e) => updateSignatory(s.id, { name: e.target.value })} placeholder="Full legal name" />
            </Field>
            <Field label="Emirates ID number">
              <Input value={s.idNumber} onChange={(e) => updateSignatory(s.id, { idNumber: e.target.value })} placeholder="784-XXXX-XXXXXXX-X" />
            </Field>
            <Field label="Role / authority basis">
              <Select value={s.role} onChange={(e) => updateSignatory(s.id, { role: e.target.value })}>
                <option>Owner</option>
                <option>General Manager (POA)</option>
                <option>Delegated representative</option>
              </Select>
            </Field>
            <Field label="Mobile number">
              <Input value={s.mobile} onChange={(e) => updateSignatory(s.id, { mobile: e.target.value })} placeholder="+971 5X XXX XXXX" />
            </Field>
            <Field label="Email">
              <Input value={s.email} onChange={(e) => updateSignatory(s.id, { email: e.target.value })} placeholder="name@company.ae" />
            </Field>
          </Card>
        );
      })}

      <Button variant="secondary" onClick={addSignatory}>
        + Add another signatory
      </Button>

      <div className="mt-auto flex gap-2.5 pt-2">
        <Button variant="secondary" onClick={() => router.push(isExistingCustomer ? "/applicant/consent" : "/applicant/business")}>
          Back
        </Button>
        <Button className="flex-1" disabled={!allComplete} onClick={() => router.push("/applicant/review")}>
          Continue to review
        </Button>
      </div>
    </PhoneFrame>
  );
}
