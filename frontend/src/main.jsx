import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SidebarProvider } from "./contexts/SidebarContext.jsx";
import { QuizQuestionModalProvider } from "./contexts/QuizQuestionModalContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SidebarProvider>
        <QuizQuestionModalProvider>
          <App />
        </QuizQuestionModalProvider>
      </SidebarProvider>
    </BrowserRouter>
  </StrictMode>,
);
