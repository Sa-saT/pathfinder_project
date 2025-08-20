# 🎵 Pathfinder - 音源共有アプリ

Nuxt4 + Vercel Blob + PostgreSQL を使用した音源共有アプリケーションです。

## ✨ 機能

- 🔐 JWT認証によるユーザー管理
- 📤 音源ファイルのアップロード（Vercel Blob）
- 🎵 音源の再生・ダウンロード
- 🏷️ タグ付けとメタデータ管理
- 📱 レスポンシブデザイン

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env` ファイルを作成し、以下の環境変数を設定してください：

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/pathfinder

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here
```

### 3. データベースの初期化

PostgreSQLデータベースに接続し、`database/init.sql` を実行してください：

```bash
psql -d pathfinder -f database/init.sql
```

### 4. 開発サーバーの起動

```bash
pnpm dev
```

## 🏗️ アーキテクチャ

### バックエンド（Nuxt Nitro API）

- **認証**: JWT + Cookie
- **データベース**: PostgreSQL（ORM不使用、DDL直書き）
- **ファイルストレージ**: Vercel Blob
- **パスワードハッシュ**: bcrypt

### フロントエンド

- **フレームワーク**: Nuxt 4 + Vue 3
- **スタイリング**: CSS（Tailwind不使用）
- **状態管理**: Vue Composition API

## 📡 API エンドポイント

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| POST | `/api/auth/register` | 新規ユーザー登録 | ❌ |
| POST | `/api/auth/login` | JWTログイン | ❌ |
| GET | `/api/auth/me` | ログインユーザー情報 | ✅ |
| POST | `/api/sounds/upload-url` | 音源アップロードURL発行 | ✅ |
| POST | `/api/sounds/metadata` | 音源メタデータ登録 | ✅ |
| GET | `/api/sounds/:id/stream` | 音源再生 | ❌ |
| GET | `/api/sounds/:id/download` | 音源ダウンロード | ✅ |

## 🚀 デプロイ

### Vercel

1. Vercel Blobを有効化：
```bash
vercel storage link
```

2. 環境変数を設定：
   - `DATABASE_URL`
   - `BLOB_READ_WRITE_TOKEN`
   - `JWT_SECRET`

3. デプロイ：
```bash
vercel --prod
```

## 🔧 開発

### データベース接続

```typescript
import { query } from '~/server/utils/db'

// クエリの実行
const result = await query('SELECT * FROM sounds WHERE is_public = true')
```

### 認証ミドルウェア

```typescript
// CookieからJWTトークンを取得
const token = getCookie(event, 'Authorization')
if (!token || !token.startsWith('Bearer ')) {
  throw createError({ statusCode: 401, message: 'Authentication required' })
}
```

## 📝 注意事項

- PrismaなどのORMは使用していません
- マイグレーションはSQLファイルで手動管理
- 音源ファイルの変換は行わず、オリジナルを配信
- セキュリティはJWT + Cookieで実装

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更をコミット
4. プルリクエストを作成

## 📄 ライセンス

MIT License
