"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ViewMode = "mobile" | "web";

const ViewModeContext = createContext<{ viewMode: ViewMode; setViewMode: (v: ViewMode) => void }>({
  viewMode: "mobile",
  setViewMode: () => {},
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");
  return <ViewModeContext.Provider value={{ viewMode, setViewMode }}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
