import "./globals.css";
import { Inter } from "next/font/google";
import { Sidebar } from "./Sidebar";

import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { SidebarButtons } from "@/components/SidebarButtons";
import {
  SidebarContainer,
  SidebarContextProvider,
} from "@/components/SidebarContainer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Parakeet AI",
  description: "AI chat app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={inter.className + " w-full h-screen relative flex z-0"}
        >
          <SidebarContextProvider>
            <SidebarContainer>
              <SidebarButtons />
              <Sidebar />
            </SidebarContainer>
            <main className="flex-grow">{children}</main>
          </SidebarContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
