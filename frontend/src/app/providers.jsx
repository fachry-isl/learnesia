"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { QuizQuestionModalProvider } from "@/contexts/QuizQuestionModalContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <QuizQuestionModalProvider>{children}</QuizQuestionModalProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}
