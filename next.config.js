/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/f/abc12', // Default video
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;