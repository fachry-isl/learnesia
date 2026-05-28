import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/public/Navbar", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

describe("PublicLayout", () => {
  it("renders children inside the public shell with navbar", async () => {
    const PublicLayout = (await import("@/app/(public)/layout")).default;

    render(
      <PublicLayout>
        <p>Public content</p>
      </PublicLayout>,
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("Public content")).toBeInTheDocument();
  });
});
