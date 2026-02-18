# Face Calendar - 本番デプロイガイド

## 構成概要

- **フロントエンド**: Next.js → Vercel
- **バックエンド**: Go + chi → Google Cloud Run
- **データベース**: PostgreSQL（Supabase）
- **認証**: Firebase Authentication（Google Sign-In）

## 前提条件

- Google Cloud アカウント（課金有効）
- Firebase プロジェクト
- Vercel アカウント
- Supabase アカウント
- GitHub リポジトリ

## Phase 1: Firebase セットアップ

### 1.1 プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com) でプロジェクトを作成
2. ウェブアプリを追加し、SDK 設定値を取得

### 1.2 Google Sign-In 有効化

1. Authentication → Sign-in method → Google → 有効にする
2. 承認済みドメインに Vercel のドメインを追加

### 1.3 サービスアカウントキー

1. プロジェクトの設定 → サービスアカウント → 新しい秘密鍵の生成
2. JSON を安全に保管（Cloud Run の Secret Manager で使用）

## Phase 2: Supabase セットアップ

### 2.1 プロジェクト作成

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. リージョン: `Northeast Asia (Tokyo)` を選択

### 2.2 接続情報の取得

1. Settings → Database → Connection string (URI) をコピー
2. 形式: `postgres://postgres.[ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`

> テーブルはバックエンド起動時に自動作成されます。

## Phase 3: Google Cloud Run セットアップ

### 3.1 API の有効化

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com
```

### 3.2 Firebase クレデンシャルを Secret Manager に保存

```bash
gcloud secrets create firebase-credentials --data-file=backend/firebase-credentials.json
```

### 3.3 環境変数

Cloud Run に以下の環境変数を設定:

```
PORT=8080
DATABASE_URL=postgres://postgres.[ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-credentials.json
```

### 3.4 デプロイ

Option 1: Cloud Build（推奨）
1. GitHub リポジトリに push
2. Cloud Build → トリガーを作成 → `backend/cloudbuild.yaml` を指定

Option 2: 手動
```bash
cd backend
gcloud builds submit --config cloudbuild.yaml
```

## Phase 4: Vercel デプロイ

### 4.1 環境変数

Vercel のプロジェクト設定で以下を追加:

```
NEXT_PUBLIC_FIREBASE_API_KEY=<value>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<value>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<value>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<value>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<value>
NEXT_PUBLIC_FIREBASE_APP_ID=<value>
NEXT_PUBLIC_API_URL=https://<cloud-run-url>/api/v1
```

### 4.2 デプロイ

1. GitHub リポジトリを Vercel に接続
2. ルートディレクトリ: `frontend`
3. Deploy

## テストチェックリスト

- [ ] Firebase ログインが動作する
- [ ] エントリの CRUD が全て動く
- [ ] 不正なトークンが拒否される
- [ ] ユーザーごとにデータが分離されている
- [ ] CORS が本番ドメインを許可
- [ ] Cloud Run デプロイ成功
- [ ] Vercel デプロイ成功
- [ ] E2E: ログイン → 作成 → 表示 → 更新 → 削除

## コスト見積もり

| サービス | 月額 |
|---------|------|
| Firebase (Spark plan) | $0 |
| Supabase (Free plan) | $0 |
| Cloud Run (低トラフィック) | $0-5 |
| Vercel (Free plan) | $0 |
| **合計** | **$0-5** |

## トラブルシューティング

### CORS エラー
→ `CORS_ALLOWED_ORIGINS` が Vercel の URL と一致しているか確認

### Cloud Run デプロイ失敗
→ `gcloud builds log <build-id>` でログ確認

### データベース接続エラー
→ `DATABASE_URL` が正しい形式か確認（Supabase の Pooler URL を使用）

### Firebase トークン検証失敗
→ Secret Manager のクレデンシャルが正しいか確認
