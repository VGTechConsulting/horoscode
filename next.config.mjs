/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages serves files, not a Node process: `next build` must produce a
  // complete `out/` and nothing that needs a request-time handler
  // (github-pages-deployment.spec.md §2.1).
  output: 'export',
  // Directory-style routes — out/privacy/index.html — so Pages resolves
  // /privacy/ and a hard refresh of it without a rewrite rule.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // No headers() here. Static export has no server to set them, and Pages
  // exposes no per-project response-header configuration; the deployment spec
  // adds no meta-tag replacement as part of this work (§2.1, §1.2).
  // No redirects or rewrites either: the GitHub-project-URL redirect is a Pages
  // custom-domain concern, not a Next.js one.
}

export default nextConfig
