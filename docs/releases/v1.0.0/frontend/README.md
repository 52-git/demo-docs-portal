# unx-knowledge-ui

## 概要
UNX ナレッジ検索/対話システムのフロントエンドです。React + Vite + Arco Design をベースに、Socket.IO ストリーミング回答、管理画面 CRUD、SSOログインを提供します。

## 主要機能
- チャット UI（Markdown 表示、参照表示、継続回答）。
- 部署・モデル選択 UI と履歴の保持（sessionStorage）。
- 管理画面（部署/管理者/外部サービス/接続/ナレッジソースなど）。
- Cognito SSO 連携（ポップアップ + コールバック）。
- IP 制限チェック（ホワイト/ブラックリスト対応）。

## 技術スタック
- React 19 + TypeScript
- Vite
- Arco Design
- Socket.IO Client
- React Markdown + rehype-sanitize

## ルーティング
`App.tsx` が IP 制限 → 認証 → レイアウトの順にガードします。
- `/login`: SSO ログイン
- `/callback`: SSO コールバック
- `/chat`: チャット
- `/departments`, `/admins`, `/ext-services`, `/answer-areas`, `/ext-resources`, `/ext-connections`, `/knowledge`

## チャットの流れ
1. `/departments` と `/models` を取得し選択 UI を表示。
2. Socket.IO に `chat` を送信。
3. `partial` を受け取りストリーミング表示。
4. `done` で最終化、継続可能セクションを UI に反映。
5. いいね/バッドは `/api/feedback/reaction` に送信。

## 認証の流れ
1. `/login` で Cognito へリダイレクト。
2. `/callback` で `id_token` と `session_id` をバックエンドへ送信。
3. `localStorage` でメインウィンドウへ通知。
4. 必要に応じて `/api/auth/status` でポーリング。

※ バックエンド側に `/api/auth/callback` と `/api/auth/status` が必要です。

## IP 制限
`VITE_IP_RESTRICTION_ENABLED=true` の場合に IP チェックを有効化します。
- `VITE_IP_CHECK_ENDPOINT` があればそれを使用。
- 未指定なら `https://api.ipify.org` で取得。

## 環境変数
- `VITE_API_BASE_URL`: API ベース URL（未指定時は `https://dev.unisrv-genai-service.com`）。
- `VITE_IP_RESTRICTION_ENABLED`: IP 制限の有効/無効。
- `VITE_IP_WHITELIST`: 許可 IP（カンマ区切り、CIDR/ワイルドカード対応）。
- `VITE_IP_BLACKLIST`: 拒否 IP。
- `VITE_IP_CHECK_ENDPOINT`: IP 取得用エンドポイント。
- `VITE_COGNITO_CLIENT_ID`: Cognito Client ID。
- `VITE_COGNITO_DOMAIN`: Cognito ドメイン。

## 開発/ビルド
```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

```bash
npm run lint
```

## モック
`mock deprecated/` に json-server 用の簡易モックがあります。
```bash
npm run mock
```

## ディレクトリ構成
- `src/chat`: Socket.IO とチャット状態管理。
- `src/auth`: 認証状態とユーザー情報の保持。
- `src/pages`: 画面コンポーネント。
- `src/layout`: 共通レイアウト（ヘッダー/メニュー）。
- `src/hooks`: fetch ヘルパー、IP 制限フック。
- `src/styles`: アプリ全体スタイル。

## README 索引
- `src/README.md`: フロントエンド全体の構成と役割。
- `src/chat/README.md`: チャット状態管理と Socket.IO。
- `src/auth/README.md`: 認証コンテキストとユーザー情報。
- `src/pages/README.md`: 画面一覧と役割。
- `src/layout/README.md`: 共通レイアウト。
- `src/hooks/README.md`: 共通フックと fetch ヘルパー。
