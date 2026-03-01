import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SidebarProvider } from "./contexts/SidebarContext.jsx";
import { QuizQuestionModalProvider } from "./contexts/QuizQuestionModalContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
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
