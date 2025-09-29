import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pagesの場合、リポジトリ名がbasePathになります
  // 例: https://username.github.io/repo-name/
  basePath: '/ValueGames',
  assetPrefix: '/ValueGames',
};

export default nextConfig;
