/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false,
  },
  async rewrites() {
    return [
      {
        source: '/f/:videoID',
        destination: '/f/:videoID',
      },
    ];
  },
};

module.exports = nextConfig;