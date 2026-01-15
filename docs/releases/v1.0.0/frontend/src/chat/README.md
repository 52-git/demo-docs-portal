# src/chat/

## 概要
チャット UI の状態管理と Socket.IO 通信を担当します。`ChatContext.tsx` が中心です。

## ChatContext の主な責務
- メッセージ履歴の保持（sessionStorage）。
- 部署/モデルの選択状態の保持。
- Socket.IO の `partial`/`done`/`error` 受信処理。
- セクション分割（レベル別回答）と継続ボタンの制御。

## 通信フロー
- `chat` イベント: `{ query, dept, model }` を送信。
- `partial` イベント: ストリーミング本文を追記。
- `done` イベント: 参照/継続情報を統合。
- `continue` イベント: 継続回答を取得。
