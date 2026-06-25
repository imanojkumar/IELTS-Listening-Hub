/**
 * Next.js configuration for IELTS Listening Hub.
 *
 * Static export so the whole site can be hosted on GitHub Pages (or any
 * static host) with no server. Set the repo name in NEXT_PUBLIC_BASE_PATH
 * when deploying to a project page, e.g. https://user.github.io/ielts-listening-hub
 *   NEXT_PUBLIC_BASE_PATH=/ielts-listening-hub npm run build
 * Leave it empty for a user/organisation page or a custom domain.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Surface a clean public env var for client code (audio/image src building).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
