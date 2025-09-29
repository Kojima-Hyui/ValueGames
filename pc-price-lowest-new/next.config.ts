import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番デプロイ設定
  output: 'standalone', // Docker や Node.js サーバー用
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 外部画像（ゲームバナー）を許可
      },
    ],
  },
  // パフォーマンス最適化
  compress: true,
  // セキュリティヘッダー
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
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
