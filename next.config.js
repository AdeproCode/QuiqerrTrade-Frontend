const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  turbopack: {
    root: path.resolve(__dirname),
  },
  
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;