# PC Price Lowest New

ゲーム価格比較アプリケーション

## 機能

- IsThereAnyDeal APIを使用したゲーム検索
- 複数ストアでの価格比較
- 現在価格と歴代最安値の表示
- サブスクリプションサービス対応（Xbox Game Pass、Epic Games Storeの無料ゲーム）

## GitHub Pagesへのデプロイ

このプロジェクトはGitHub Pagesで静的サイトとしてホストできるよう設定されています。

### セットアップ手順

1. **リポジトリをGitHubにプッシュ**

2. **GitHub Pagesを有効化**
   - リポジトリの Settings > Pages
   - Source: "GitHub Actions" を選択

3. **環境変数の設定（オプション）**
   - IsThereAnyDeal APIキーを使用する場合
   - リポジトリの Settings > Secrets and variables > Actions
   - `NEXT_PUBLIC_ITAD_API_KEY` を追加

4. **basePathの設定（必要に応じて）**
   - `next.config.ts` で以下を有効化：
   ```typescript
   basePath: '/pc-price-lowest-new',
   assetPrefix: '/pc-price-lowest-new',
   ```

5. **自動デプロイ**
   - `main` ブランチへのプッシュで自動デプロイ
   - GitHub Actionsがビルドと公開を実行

### 開発環境

```bash
npm install
npm run dev
```

### ビルド

```bash
npm run build
```

静的ファイルは `out/` ディレクトリに生成されます。

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)
- IsThereAnyDeal API

## 注意事項

- APIキーはクライアントサイドで使用されるため、パブリックキーのみ使用してください
- GitHub Pages環境では制限があるため、一部の機能が動作しない場合があります
# Force workflow restart
