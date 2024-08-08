/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: ['pdf-parse'],
    },
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.experiments = {
          ...config.experiments,
          topLevelAwait: true,
        }
      }
      return config
    },
  }
  
  export default nextConfig;