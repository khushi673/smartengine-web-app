"use client";

import { ReactNode, useState } from "react";
import { DesktopFrame } from "@/components/ui/DeviceFrame";
import { Panel } from "@/components/ui/Card";
import { Badge, CaseStatusBadge, VerificationBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableWrap, Th, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { useCaseStore } from "@/components/shell/CaseStoreContext";
import { useToast } from "@/components/shell/ToastContext";
import { VerificationCheck, VerificationState, TimelineEventKind } from "@/lib/mock-data";

const TIMELINE_ICON: Record<TimelineEventKind, string> = {
  status: "🗂️",
  document: "📄",
  note: "✉️",
  signatory: "🖊️",
  verification: "🔎",
  handoff: "🤝",
  consent: "✅",
};

const RESULT_LABEL: Record<VerificationState, string> = {
  verified: "Match",
  matched: "Match",
  partially_matched: "Partial match",
  mismatch: "Mismatch",
  unable_to_verify: "Unable to verify",
  bank_review_required: "Bank review required",
  pending: "Pending",
  integration_unavailable: "Unavailable",
};

const RESULT_COLOR: Record<VerificationState, string> = {
  verified: "text-[var(--success-text)]",
  matched: "text-[var(--success-text)]",
  partially_matched: "text-[var(--warning-text)]",
  mismatch: "text-[var(--danger-text)]",
  unable_to_verify: "text-[var(--danger-text)]",
  bank_review_required: "text-[var(--info-text)]",
  pending: "text-[var(--muted)]",
  integration_unavailable: "text-[var(--muted)]",
};

const SEED_NOTES: Record<string, string[]> = {
  alnoor: ["Expiry mismatch looks like a renewal in progress — requested an updated copy. Everything else checks out. — S. Khan"],
  zenith: ["Trade licence unreadable on the second upload too — flagging for manual registry lookup rather than a third re-request. — Unassigned"],
};

export function CaseWorkspaceClient({ caseId }: { caseId: string }) {
  const { getCase, markReadyForHandoff, requestInformation } = useCaseStore();
  const { showToast } = useToast();
  const c = getCase(caseId);

  const [handoffOpen, setHandoffOpen] = useState(false);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [checkedFields, setCheckedFields] = useState<Set<string>>(new Set());
  const [freeNote, setFreeNote] = useState("");
  const [evidenceTarget, setEvidenceTarget] = useState<VerificationCheck | null>(null);
  const [notes, setNotes] = useState<string[]>(SEED_NOTES[caseId] ?? []);
  const [newNote, setNewNote] = useState("");

  if (!c) return null;

  const openItems = c.verification.filter((v) => v.state === "mismatch" || v.state === "unable_to_verify");
  const hasBlockingExceptions = openItems.length > 0;
  const alreadyReady = c.status === "ready_for_handoff" || c.status === "handed_off";
  const canMarkReady = !hasBlockingExceptions && !alreadyReady;

  const toggleInfoPanel = () => {
    if (!infoPanelOpen) setCheckedFields(new Set(openItems.map((v) => v.field)));
    setInfoPanelOpen((v) => !v);
  };

  const toggleField = (field: string) => {
    setCheckedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const sendInfoRequest = () => {
    const note = openItems.length > 0 ? Array.from(checkedFields).join(", ") : freeNote.trim();
    requestInformation(c.id, note);
    showToast("Information request sent to the applicant.", "warning");
    setInfoPanelOpen(false);
    setFreeNote("");
  };

  const confirmHandoff = () => {
    markReadyForHandoff(c.id);
    showToast(`${c.business} marked ready for handoff.`, "success");
    setHandoffOpen(false);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [...prev, `${newNote.trim()} — Operations`]);
    setNewNote("");
  };

  return (
    <DesktopFrame>
      <div className="flex flex-col gap-4.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[19px]">{c.business}</h2>
              <CaseStatusBadge status={c.status} />
              {c.existingCustomer && <Badge tone="info">Existing customer</Badge>}
            </div>
            <span className="tabular-nums text-[12.5px] text-[var(--muted)]">
              {c.ref} · assigned to {c.assignee ?? "Unassigned"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" disabled={c.status === "handed_off"} onClick={toggleInfoPanel}>
              Request information
            </Button>
            {alreadyReady ? (
              <Button size="sm" disabled>
                {c.status === "handed_off" ? "Handed off" : "Ready for handoff"}
              </Button>
            ) : (
              <Button size="sm" disabled={!canMarkReady} onClick={() => setHandoffOpen(true)}>
                Mark ready for handoff
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-4.5 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-4.5">
            <SectionCard title="Applicant data" sub="As submitted by the applicant.">
              <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2.5 text-[13px]">
                <Kv label="Legal business name" value={c.business} />
                <Kv label="Structure" value={c.structure} />
                <Kv label="Trade licence no." value={c.tradeLicenceNo} />
                <Kv label="Emirate" value={c.emirate} />
                <Kv label="Signatory" value={`${c.signatoryName} · ${c.signatoryRole}`} />
                <Kv label="Contact" value={`${c.signatoryEmail} · ${c.signatoryPhone}`} />
              </dl>
            </SectionCard>

            <SectionCard title="Applicant data vs. SmartEngine extraction" sub="Source-level comparison so the officer only looks where it disagrees.">
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Field</Th>
                    <Th>Applicant entered</Th>
                    <Th>Extracted</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {c.verification.map((v) => (
                    <tr key={v.field} className={v.state === "mismatch" ? "bg-[var(--warning-bg)]" : ""}>
                      <Td>{v.field}</Td>
                      <Td>{v.applicantEntered}</Td>
                      <Td>{v.extracted}</Td>
                      <Td className={`font-bold ${RESULT_COLOR[v.state]}`}>{RESULT_LABEL[v.state]}</Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </SectionCard>

            <SectionCard title="Documents" sub="Secure preview · versioned · replacement history retained.">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {c.documents.map((d) => (
                  <div key={d.name} className="w-32 shrink-0 rounded-[10px] border border-[var(--border)] p-3">
                    <div className="mb-2.5 flex h-14 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[10px] text-[var(--muted)]">
                      DOC
                    </div>
                    <div className="truncate text-[11.5px] font-bold">{d.name}</div>
                    <Badge tone={d.quality === "passed" ? "success" : "warning"} dot>
                      {d.quality === "passed" ? "Verified" : "Review"}
                    </Badge>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Timeline & audit" sub="Every status change, document event, and applicant/officer action, in order.">
              <div className="flex flex-col gap-3.5">
                {c.timeline.map((t, i) => (
                  <div key={`${t.label}-${i}`} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[11px]">
                      {TIMELINE_ICON[t.kind ?? "status"]}
                    </span>
                    <div>
                      <strong className="text-[13px]">{t.label}</strong>
                      {t.detail && <div className="text-[11.5px] text-[var(--muted)]">{t.detail}</div>}
                      <div className="text-[11px] text-[var(--muted)]">
                        {t.timestamp} · {t.actor}
                        {t.tone === "warning" && <span className="ml-1.5 font-bold text-[var(--warning-text)]">· flagged</span>}
                        {t.tone === "success" && <span className="ml-1.5 font-bold text-[var(--success-text)]">· resolved</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="flex flex-col gap-4.5">
            <SectionCard title="Verification" sub="Same normalized states regardless of which route answered — source is always available.">
              <div className="flex flex-col gap-2.5">
                {c.verification.map((v) => (
                  <div key={v.field} className="rounded-[10px] border border-[var(--border)] p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-bold">{v.field}</span>
                      <VerificationBadge state={v.state} />
                    </div>
                    <div className="text-[11.5px] text-[var(--muted)]">Source: {v.source}</div>
                    <button
                      className="mt-1.5 text-[11.5px] font-bold text-[var(--brand)]"
                      onClick={() => setEvidenceTarget(v)}
                    >
                      View evidence
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {infoPanelOpen && (
              <SectionCard title="Request information" sub="The applicant is notified and can only edit the items selected here.">
                {openItems.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {openItems.map((v) => (
                      <label key={v.field} className="flex items-start gap-2.5 text-[12.5px]">
                        <input
                          type="checkbox"
                          checked={checkedFields.has(v.field)}
                          onChange={() => toggleField(v.field)}
                          className="mt-0.5 accent-[var(--brand)]"
                        />
                        {v.field}
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={freeNote}
                    onChange={(e) => setFreeNote(e.target.value)}
                    rows={3}
                    placeholder="What do you need from the applicant?"
                    className="w-full rounded-md border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--brand)]"
                  />
                )}
                <Button size="sm" className="mt-3.5" block onClick={sendInfoRequest} disabled={openItems.length > 0 && checkedFields.size === 0}>
                  Send request to applicant
                </Button>
              </SectionCard>
            )}

            <SectionCard title="Notes" sub="Internal only · not visible to the applicant.">
              <div className="flex flex-col gap-2.5">
                {notes.length === 0 && <span className="text-[12.5px] text-[var(--muted)]">No notes yet.</span>}
                {notes.map((n, i) => (
                  <p key={i} className="rounded-md bg-[var(--surface)] p-2.5 text-[12px] text-[var(--body,var(--ink))]">
                    &ldquo;{n}&rdquo;
                  </p>
                ))}
                <div className="mt-1 flex gap-2">
                  <input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal note…"
                    className="min-w-0 flex-1 rounded-md border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-[12.5px] outline-none focus:border-[var(--brand)]"
                  />
                  <Button size="sm" variant="secondary" onClick={addNote}>Add</Button>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <Modal
        open={handoffOpen}
        onClose={() => setHandoffOpen(false)}
        title="Mark ready for handoff"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setHandoffOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={confirmHandoff}>Confirm</Button>
          </>
        }
      >
        <p className="text-[13px] text-[var(--muted)]">
          {c.business} ({c.ref}) will move to <strong className="text-[var(--ink-strong)]">Ready for handoff</strong>. The bank&apos;s
          downstream systems will see this case as ready for processing.
        </p>
      </Modal>

      <Modal
        open={!!evidenceTarget}
        onClose={() => setEvidenceTarget(null)}
        title={evidenceTarget ? `Document evidence — ${evidenceTarget.field}` : "Document evidence"}
        footer={<Button size="sm" variant="secondary" onClick={() => setEvidenceTarget(null)}>Close</Button>}
      >
        {evidenceTarget && (
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
              <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded border border-[var(--border-strong)] bg-[var(--surface-2)] text-[10px] text-[var(--muted)]">
                DOC
              </div>
              <div>
                <div className="font-bold">Source document</div>
                <div className="text-[var(--muted)]">{evidenceTarget.source}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-bold text-[var(--muted)] uppercase">Applicant entered</div>
                <div>{evidenceTarget.applicantEntered}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-[var(--muted)] uppercase">Extracted from document</div>
                <div>{evidenceTarget.extracted}</div>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[11px] font-bold text-[var(--muted)] uppercase">Verification result</div>
              <VerificationBadge state={evidenceTarget.state} />
            </div>
          </div>
        )}
      </Modal>
    </DesktopFrame>
  );
}

function SectionCard({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <Panel className="p-4.5">
      <strong className="text-[14px]">{title}</strong>
      {sub && <div className="mt-0.5 mb-3.5 text-[11.5px] text-[var(--muted)]">{sub}</div>}
      <div className={sub ? "" : "mt-3.5"}>{children}</div>
    </Panel>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="m-0">{value}</dd>
    </>
  );
}
