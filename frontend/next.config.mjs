/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    NEXT_PUBLIC_LEGACY_API_URL: process.env.NEXT_PUBLIC_LEGACY_API_URL || 'http://localhost:3000/api',
  },
};

export default nextConfig;
