import { ReactNode } from "react";
import { TenantThemeProvider } from "@/components/shell/TenantThemeContext";
import { ViewModeProvider } from "@/components/shell/ViewModeContext";
import { CaseStoreProvider } from "@/components/shell/CaseStoreContext";
import { CampaignStoreProvider } from "@/components/shell/CampaignStoreContext";
import { VerificationRoutesProvider } from "@/components/shell/VerificationRoutesContext";
import { AdminActivityProvider } from "@/components/shell/AdminActivityContext";
import { ToastProvider } from "@/components/shell/ToastContext";
import { AppShell } from "@/components/shell/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <TenantThemeProvider>
      <ViewModeProvider>
        <CaseStoreProvider>
          <CampaignStoreProvider>
            <VerificationRoutesProvider>
              <AdminActivityProvider>
                <ToastProvider>
                  <AppShell>{children}</AppShell>
                </ToastProvider>
              </AdminActivityProvider>
            </VerificationRoutesProvider>
          </CampaignStoreProvider>
        </CaseStoreProvider>
      </ViewModeProvider>
    </TenantThemeProvider>
  );
}
