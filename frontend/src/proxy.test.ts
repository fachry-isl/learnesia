import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("admin proxy (default path: /admin)", () => {
  it("redirects unauthenticated admin requests to login", () => {
    const request = new NextRequest("http://localhost:3000/admin/courses");
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/admin/login");
  });

  it("allows login route without a cookie", () => {
    const request = new NextRequest("http://localhost:3000/admin/login?sk=some-key");
    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
  });

  it("allows authenticated admin requests through", () => {
    const request = new NextRequest("http://localhost:3000/admin/courses");
    request.cookies.set("accessToken", "token-value");
    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
  });

  it("passes through non-admin routes without any action", () => {
    const request = new NextRequest("http://localhost:3000/courses");
    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
