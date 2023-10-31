"use client";
import { useState, PropsWithChildren, createContext, useContext } from "react";

export const SidebarContext = createContext<{
  isSideBarOpen: boolean;
  setIsSideBarOpen: (value: boolean) => void;
  toggleSidebar: () => void;
}>({
  isSideBarOpen: false,
  setIsSideBarOpen: () => {},
  toggleSidebar: () => {},
});
export const useSidebarToggle = () => useContext(SidebarContext);
export const SidebarContextProvider = ({ children }: PropsWithChildren) => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSideBarOpen(!isSideBarOpen);
  };
  return (
    <SidebarContext.Provider
      value={{ isSideBarOpen, setIsSideBarOpen, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
export const SidebarContainer = ({ children }: PropsWithChildren) => {
  const { isSideBarOpen, setIsSideBarOpen } = useSidebarToggle();
  return (
    <nav
      className={`fixed md:relative flex-shrink-0 overflow-x-hidden bg-gray-900 w-full md:w-1/5 z-50 md:translate-x-0 text-white transition-all
        ${isSideBarOpen ? " translate-x-0" : " -translate-x-full"}`}
    >
      {children}
    </nav>
  );
};
