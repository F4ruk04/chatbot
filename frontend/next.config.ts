import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações para produção
  output: 'standalone',
  
  // Configurações de imagem para Vercel
  images: {
    domains: ['localhost', 'chatbot-production-d2d7.up.railway.app'],
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
        ],
      },
    ];
  },
};

export default nextConfig;
