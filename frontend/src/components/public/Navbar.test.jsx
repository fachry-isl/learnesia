import { describe, it, expect, vi, beforeEach } from "vitest";
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

describe("Navbar", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("renders nav links without react-router-dom", async () => {
    const Navbar = (await import("@/components/public/Navbar")).default;

    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute("href", "/courses");
    expect(screen.getByAltText("Learnesia")).toHaveAttribute("src", "/li_logo_full.png");
  });
});
