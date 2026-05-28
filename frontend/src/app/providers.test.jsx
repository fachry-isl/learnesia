import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Providers from "./providers";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";

function AuthProbe() {
  const { accessToken } = useAuth();
  return <span data-testid="auth-probe">{accessToken === null ? "ready" : "token"}</span>;
}

function SidebarProbe() {
  const sidebar = useSidebar();
  return <span data-testid="sidebar-probe">{sidebar ? "ready" : "missing"}</span>;
}

describe("Providers", () => {
  it("renders children inside all three context providers", () => {
    render(
      <Providers>
        <p>Hello Learnesia</p>
        <AuthProbe />
        <SidebarProbe />
      </Providers>,
    );

    expect(screen.getByText("Hello Learnesia")).toBeInTheDocument();
    expect(screen.getByTestId("auth-probe")).toHaveTextContent("ready");
    expect(screen.getByTestId("sidebar-probe")).toHaveTextContent("ready");
  });
});
