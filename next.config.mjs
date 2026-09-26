/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // the CV PDF renderer runs server-side only; keep it out of the webpack bundle
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

export default nextConfig;
