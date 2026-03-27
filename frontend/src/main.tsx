import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { SidebarProvider } from "./contexts/SidebarContext";
import { QuizQuestionModalProvider } from "./contexts/QuizQuestionModalContext";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <QuizQuestionModalProvider>
              <App />
            </QuizQuestionModalProvider>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}
