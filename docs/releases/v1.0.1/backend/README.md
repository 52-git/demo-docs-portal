# unx-knowledge-backend

## 概要
企業内ナレッジ検索と対話を提供するバックエンドです。FastAPI + Socket.IO を中心に、DynamoDB/FAISS/S3/BEDROCK を組み合わせてナレッジの取り込み、ベクトル検索、回答生成、継続回答を提供します。

## 主要コンポーネント
- FastAPI: REST API とヘルスチェック。
- Socket.IO: ストリーミング回答、継続回答イベント。
- DynamoDB: ナレッジ・設定・ユーザー・フィードバック・ジョブ管理。
- S3: 取り込みナレッジの格納、ユーザー写真の保存。
- FAISS: 埋め込み検索インデックスの構築。
- Bedrock: 埋め込み生成（Titan Embed）。
- LLM: OpenAI / Anthropic Claude / Google Gemini をストリーミングで利用。
- APScheduler + DDB: ジョブ定義に基づくバックグラウンド実行。

## 主要機能
- チャット回答（Socket.IO）: 部署・レベル別ナレッジ検索、参照リンク、継続回答。
- Teams Bot 連携: Adaptive Card での回答、続きボタン。
- フィードバック: リアクション/コメント/継続回答の保存。
- 管理 CRUD: 部署、管理者、外部サービス、回答エリア、外部接続、ナレッジソース。
- 取り込みパイプライン: 外部ソースを S3 に同期 → 埋め込み生成 → DynamoDB へ登録。
- Microsoft Graph 連携: 社員情報と写真の同期。
- DDB スケジューラ: 取り込み/埋め込み/インデックス再読込を定期実行。

## データフロー（概要）
1. `services/import_to_s3.py` が外部ソースを取得し S3 + DATA_TABLE を更新。
2. `services/s3_to_dynamodb.py` が S3 を走査して埋め込みを作成し EMBEDDING_TABLE へ登録。
3. `repositories/knowledge_index.py` が EMBEDDING_TABLE を読み込み FAISS を構築。
4. Socket.IO で `chat` → ベクトル検索 → LLM 生成 → `partial`/`done` を送信。
5. フィードバック/継続情報を FEEDBACK_TABLE / CHAT_CONTINUATION_TABLE に保存。

## ディレクトリ構成
- `app/main.py`: FastAPI + Socket.IO エントリ。ライフサイクルで各種カタログ/インデックスを初期化。
- `app/api/`: REST API（管理系 CRUD、ユーザー、シークレット）。
- `app/integrations/`: チャット連携（Socket.IO/Teams）と LLM クライアント。
- `app/services/`: 取り込み・埋め込み・ユーザー同期。
- `app/repositories/`: FAISS インデックス、DDB カタログ/ストア。
- `app/tasks/`: DDB 駆動スケジューラ。
- `app/utils/`: 共有ユーティリティ。

## README 索引
- `app/README.md`: バックエンド全体の構成と役割。
- `app/api/README.md`: REST API の仕様とエンドポイント概要。
- `app/integrations/README.md`: チャット/LLM 連携の実装概要。
- `app/repositories/README.md`: 検索インデックスと DDB リポジトリ。
- `app/services/README.md`: 取り込み・埋め込み・ユーザー同期の詳細。
- `app/tasks/README.md`: DDB スケジューラの仕組み。

## API 概要
### 基本
- `GET /healthz`: ヘルスチェック。
- `GET /departments`: チャットで使う部署一覧（SOURCE_CONFIG_TABLE の `folder` 由来）。
- `GET /models`: 利用可能モデル一覧。

### フィードバック/継続
- `POST /api/feedback/reaction`: いいね/バッド更新。
- `POST /api/feedback/comment`: コメント追加。
- `POST /api/feedback/continue`: 継続回答（HTTP 版）。

### バッチ/運用
- `POST /api/import_to_s3`: 外部ソース同期をバックグラウンド実行。
- `POST /api/s3_to_dynamodb`: 埋め込み生成をバックグラウンド実行。

### Teams Bot
- `POST /api/azure_chatbot`: Bot Framework 互換の webhook。

### REST（`/api/v1`）
- `admins`: 管理者 CRUD。
- `departments`: 部署 CRUD（DEPARTMENT_TABLE_NAME）。
- `answer-areas`: 回答表示エリア CRUD。
- `external-services`: 外部サービス CRUD。
- `ext-resources`: 外部サービスリソース CRUD。
- `ext-connections`: 外部サービス接続 CRUD（`/ext-connections/test` で接続テスト）。
- `knowledge-sources`: ナレッジソース CRUD。
- `users`: 一覧/詳細/同期/統計/写真。
- `secrets`: Secrets Manager の CRUD。

※ `GET` 一覧 API は `_page`/`_limit`/`_sort`/`_order` を受け取り、`X-Total-Count` を返します。

## Socket.IO イベント
- `chat`: `{ query, dept, model }` を送信すると `partial` → `done` を受信。
- `continue`: `{ feedback_id, level_key, cursor }` で継続回答。

## 環境変数（主要）
### コア
- `AWS_REGION`
- `DEFAULT_AI_MODEL`
- `SUPPORTED_AI_MODELS`
- `MAX_COMPLETION_TOKENS`
- `CORS_ALLOWED_ORIGINS`
- `CORS_SUPPORTS_CREDENTIALS`
- `CORS_EXPOSE_HEADERS`

### DynamoDB テーブル
- `SOURCE_CONFIG_TABLE`, `LEVEL_TABLE`, `DYNAMO_TABLE_NAME`, `IMPROVEMENT_TABLE_NAME`
- `FEEDBACK_TABLE_NAME`, `CHAT_CONTINUATION_TABLE_NAME`
- `DEPARTMENT_TABLE_NAME`, `ADMIN_TABLE_NAME`, `ANSWER_AREA_TABLE_NAME`
- `EXTERNAL_SERVICE_TABLE_NAME`, `EXT_RESOURCE_TABLE_NAME`, `EXT_CONNECTION_TABLE_NAME`
- `KNOWLEDGE_SOURCE_TABLE_NAME`, `USER_TABLE_NAME`
- `DATA_TABLE`, `TAG_TABLE`, `EMBEDDING_TABLE`, `JOBS_TABLE`

### S3
- `S3_BUCKET`
- `USER_PHOTO_S3_BUCKET`

### 取り込み（import_to_s3）
- `LOG_LEVEL`, `GITHUB_TOKEN`, `BACKLOG_SPACE`, `BACKLOG_API_KEY`

### 埋め込み（s3_to_dynamodb）
- `MODEL_NAME`, `CH_MAX`, `CH_MIN`, `SENT_OVERLAP`
- `MICRO_WINDOW`, `MICRO_STRIDE`
- `MAX_FILE_MB`, `MAX_WORKERS`, `MAX_INFLIGHT`, `SPOOL_THRESHOLD_MB`, `MAX_CHUNKS_PER_DOC`

### LLM API
- `OPENAI_API_KEY`, `CLAUDE_API_KEY`, `GEMINI_API_KEY`

### スケジューラ
- `ENABLE_DDB_SCHEDULER`, `DEFAULT_TZ`, `RELOAD_INTERVAL_SEC`, `LEASE_TTL_SEC`
- `APS_MAX_WORKERS`, `EMBED_DEFAULT_WORKERS`, `SCHEDULER_ID`
- `ENABLE_JOB_POOL`, `JOB_MAX_WORKERS`

### Microsoft Graph / Bot
- `TENANT_ID`, `BOT_APP_ID`, `BOT_APP_PASSWORD`

### インデックス構築（KnowledgeIndex）
- `KI_BUILD_BATCH`, `KI_LOG_EVERY`

## ローカル起動
```bash
python -m venv .venv
. .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt

# .env を用意したうえで
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## Docker
```bash
docker build -t knowledge-service:latest .
docker run --rm -p 8080:8080 knowledge-service:latest
```

## ECR への push（例）
```bash
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 034362039295.dkr.ecr.ap-northeast-1.amazonaws.com
docker build -t knowledge-service:latest .
docker tag knowledge-service:latest 034362039295.dkr.ecr.ap-northeast-1.amazonaws.com/knowledge-service:latest
docker push 034362039295.dkr.ecr.ap-northeast-1.amazonaws.com/knowledge-service:latest
```
