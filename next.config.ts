import type { NextConfig } from "next";

// `output: 'standalone'` is only needed for self-hosted/Docker deployments.
// On Vercel it triggers a Next.js 16 + Turbopack regression where hashed
// external module aliases under `.next/node_modules` fail to resolve at
// runtime (see https://github.com/vercel/next.js/issues/93901), so we gate
// it on an explicit opt-in env var that the Dockerfile sets.
const nextConfig: NextConfig = {
  ...(process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' as const } : {}),
};

export default nextConfig;
