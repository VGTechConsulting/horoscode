/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    // Legacy URL compatibility (§5). Every link ever shared from the in-site
    // version resolves, single-hop, with the query string preserved — so a
    // reading minted at vgtc.io/toolbox/horoscode still opens on its reading.
    return [
      { source: '/toolbox/horoscode', destination: '/', permanent: true },
      { source: '/compass', destination: '/', permanent: true },
      { source: '/toolbox/compass', destination: '/', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
