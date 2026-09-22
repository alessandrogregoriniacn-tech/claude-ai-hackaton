/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export per il deploy su Firebase Hosting (app 100% client-side).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
