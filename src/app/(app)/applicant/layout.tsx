import { ReactNode } from "react";
import { ApplicantDraftProvider } from "@/components/shell/ApplicantDraftContext";

export default function ApplicantLayout({ children }: { children: ReactNode }) {
  return <ApplicantDraftProvider>{children}</ApplicantDraftProvider>;
}
