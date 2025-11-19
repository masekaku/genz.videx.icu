/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',        // Untuk optimisasi deployment
  trailingSlash: false,        // Untuk trailing slash
  images: {                    // Konfigurasi image optimization
    domains: ['example.com'],
  },
  async headers() {            // Custom headers
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
}

module.exports = nextConfig