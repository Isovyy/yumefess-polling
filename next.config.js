/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/poll',
        destination: '/maintenance',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
