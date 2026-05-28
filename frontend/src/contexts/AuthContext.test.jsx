import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

function AuthConsumer() {
  const { accessToken, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{accessToken ?? "none"}</span>
      <button type="button" onClick={() => login({ access: "abc", refresh: "xyz" })}>
        login
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "accessToken=; Path=/; Max-Age=0";
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps accessToken unset when localStorage is unavailable (SSR-safe)", () => {
    const originalLocalStorage = globalThis.localStorage;
    // @ts-expect-error simulate SSR
    delete globalThis.localStorage;

    try {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>,
      );

      expect(screen.getByTestId("token")).toHaveTextContent("none");
    } finally {
      globalThis.localStorage = originalLocalStorage;
    }
  });

  it("hydrates accessToken from localStorage after mount", async () => {
    localStorage.setItem("accessToken", "stored-token");

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("token")).toHaveTextContent("stored-token");
    });
  });

  it("mirrors access token to a cookie on login and clears it on logout", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "login" }).click();
    });

    expect(localStorage.getItem("accessToken")).toBe("abc");
    expect(document.cookie).toContain("accessToken=abc");

    await act(async () => {
      screen.getByRole("button", { name: "logout" }).click();
    });

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(document.cookie).not.toContain("accessToken=abc");
  });
});
