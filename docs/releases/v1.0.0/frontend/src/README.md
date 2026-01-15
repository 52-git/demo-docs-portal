# src/

## 概要
アプリ本体のソースコードです。エントリポイントは `main.tsx` で、`App.tsx` がルーティングとガードを構成します。

## 主要ファイル
- `main.tsx`: React ルートの起点。
- `App.tsx`: IP 制限・認証・レイアウトのガード、各ページルーティング。
- `config.ts`: API ベース URL と IP 制限設定の集約。
- `App.css`, `index.css`, `styles/app.css`: UI 共通スタイル。

## サブディレクトリ
- `auth/`: 認証状態とユーザー情報の管理。
- `chat/`: Socket.IO チャットの状態管理。
- `components/`: UI 部品（アバター/リッチテキスト）。
- `hooks/`: fetch ヘルパー、IP 制限チェック。
- `layout/`: ヘッダー/メニュー/シェル。
- `pages/`: 画面単位のコンポーネント。
- `theme/`: トークン CSS。
