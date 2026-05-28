/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    const rewrites = [
      {
        source: "/api/:path*/",
        destination: "http://backend:8000/api/:path*/",
      },
      {
        source: "/api/:path*",
        destination: "http://backend:8000/api/:path*/",
      },
    ];

    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "/admin";
    if (adminPath !== "/admin") {
      rewrites.unshift({
        source: `${adminPath}/:path*`,
        destination: "/admin/:path*",
      });
    }

    return rewrites;
  },
};

export default nextConfig;
