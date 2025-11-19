/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,       // Disarankan true untuk mendeteksi potensi masalah
  output: 'standalone',        // Bagus untuk deploy
  trailingSlash: false,        // SEO: Pastikan URL konsisten tanpa garis miring di akhir
  
  // Bagian headers ini penting untuk API video player kamu agar tidak kena CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
