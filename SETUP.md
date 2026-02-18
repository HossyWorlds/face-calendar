# Face Calendar - ローカル開発セットアップ

## 前提条件

- Node.js 18+ / npm
- Go 1.24+
- Docker / Docker Compose
- Git

## 1. Firebase プロジェクトのセットアップ

### 1.1 プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com) を開く
2. 「プロジェクトを追加」→ 名前を入力（例: `face-calendar-dev`）
3. プロジェクト作成完了後、「ウェブアプリ」を追加

### 1.2 ウェブアプリの設定値を取得

1. プロジェクトの設定 → マイアプリ → ウェブアプリ
2. SDK の設定値（apiKey, authDomain 等）をメモしておく

### 1.3 Google ログインを有効化

> **重要**: この手順を飛ばすと `auth/configuration-not-found` エラーが出ます

1. Firebase Console → Authentication → Sign-in method
2. 「Google」を選択 → 有効にする → サポートメールを入力 → 保存

### 1.4 サービスアカウントキーの取得（バックエンド用）

> **重要**: この手順を飛ばすとバックエンド API が 401 を返します

1. Firebase Console → プロジェクトの設定 → サービスアカウント
2. 「新しい秘密鍵の生成」をクリック
3. ダウンロードした JSON を `backend/firebase-credentials.json` として保存

> このファイルは `.gitignore` に含まれているため、git にコミットされません。

## 2. PostgreSQL の起動

プロジェクトルートで Docker Compose を使って PostgreSQL を起動します:

```bash
docker compose up -d
```

PostgreSQL が `localhost:5432` で起動します（DB名: `face_calendar`）。

テーブルはバックエンド起動時に自動作成されます。

### データ確認

```bash
# psql で接続
docker exec -it face-calendar-db-1 psql -U postgres -d face_calendar

# テーブル一覧
\dt

# データ確認
SELECT * FROM encounters;

# 終了
\q
```

TablePlus 等の GUI ツールで接続する場合:
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `face_calendar`

## 3. フロントエンドのセットアップ

```bash
cd frontend
npm install
```

`frontend/.env.local` を作成:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=<your_api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_project_id>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your_project_id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your_project_id>.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your_app_id>
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

起動:

```bash
npm run dev
```

http://localhost:3000 でログインページが表示されます。

## 4. バックエンドのセットアップ

```bash
cd backend
go mod download
```

> Go は `.env` ファイルを自動で読み込みません。環境変数はコマンドラインで渡してください。

起動:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./firebase-credentials.json go run main.go
```

> `GOOGLE_APPLICATION_CREDENTIALS` は Google SDK 共通の標準環境変数です。
> Firebase Admin SDK が自動的にこの値を読み取ります。
> Cloud Run 等の GCP 環境ではサービスアカウントが自動注入されるため、この環境変数は不要です。

> デフォルトで `localhost:5432/face_calendar` に接続します。
> 別の接続先を使う場合は `DATABASE_URL` 環境変数を設定してください。

http://localhost:8080/health で `OK` が返れば成功です。

## 5. 動作確認

1. http://localhost:3000 を開く
2. 「Google でログイン」でサインイン
3. カレンダーの日付をクリック → エントリを作成
4. 保存後、カレンダーに表示されることを確認

## トラブルシューティング

### `auth/configuration-not-found` エラー

Firebase Console で Google ログインが有効になっていません。
→ Authentication → Sign-in method → Google → 有効にする

### 「Failed to fetch」エラー（カレンダー画面上部の赤いバナー）

バックエンドが起動していません。
→ `GOOGLE_APPLICATION_CREDENTIALS=./firebase-credentials.json go run main.go` でバックエンドを起動

### API が 401 を返す

`GOOGLE_APPLICATION_CREDENTIALS` 環境変数が設定されていないか、ファイルが存在しません。
→ `backend/firebase-credentials.json` が存在するか確認

### ポートが使用中

```bash
# ポート 3000 を解放
lsof -ti:3000 | xargs kill -9

# ポート 8080 を解放
lsof -ti:8080 | xargs kill -9
```

### PostgreSQL に接続できない

Docker コンテナが起動しているか確認:

```bash
docker compose ps
```

停止している場合は再起動:

```bash
docker compose up -d
```

## データベース

### スキーマ

```sql
CREATE TABLE encounters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  photo_url TEXT NOT NULL,
  person_name TEXT NOT NULL,
  location TEXT,
  time_of_day TEXT CHECK(time_of_day IN ('morning', 'afternoon', 'evening')) NOT NULL,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

### 本番環境（Supabase）

本番環境では Supabase（PostgreSQL）を使用します。`DATABASE_URL` 環境変数に Supabase の接続文字列を設定してください:

```
postgres://postgres.[ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```
