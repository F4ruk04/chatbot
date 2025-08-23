import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações de imagem para Vercel
  images: {
    domains: ['localhost', 'saas-chatbot-inteligente-twilio-production.up.railway.app'],
  },
  
  // Configurações de API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },

  // Configurações de otimização para resolver problemas de carregamento
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  
  // Configurações de webpack para melhorar performance
  webpack: (config, { dev, isServer }) => {
    // Otimizações para desenvolvimento
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  
  // Configurações de compressão e cache
  compress: true,
  
  // Headers CORS para produção
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
