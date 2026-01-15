# app/

## 役割
バックエンド本体の実装ディレクトリです。FastAPI と Socket.IO を中心に、外部サービス連携やナレッジ検索、バッチ処理をまとめています。

## エントリポイント
- `main.py`: FastAPI と Socket.IO の ASGI アプリを構築。起動時に DynamoDB テーブル/インデックスを初期化します。

## サブパッケージ概要
- `api/`: 管理系 CRUD とユーザー/シークレット API のルーティング。
- `core/`: 設定（環境変数）とログ設定。
- `integrations/`: Chat 連携（Socket.IO / Teams）と LLM クライアント群。
- `repositories/`: FAISS インデックス、DynamoDB カタログ/ストア、継続回答ストレージ。
- `services/`: 取り込み・埋め込み生成・Microsoft Graph 同期などのバッチ。
- `tasks/`: DDB 駆動のスケジューラ（APScheduler）。
- `utils/`: 共有ユーティリティ（Secrets Manager、モデルストリーミングなど）。
- `schemas/`: スキーマ置き場（現状は空のパッケージ）。

## 補足
Socket.IO が必要ないケースでは `main.py` の `fastapi_app` を参照すると、純粋なFastAPI として扱えます。
