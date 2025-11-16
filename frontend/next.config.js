/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000',
  },
  // Note: Azure Static Web Apps handles /.auth/* routes at platform level
  // Our custom /auth/logout page handles the redirect to Azure SWA's /.auth/logout
  // No rewrites needed
}

module.exports = nextConfig

