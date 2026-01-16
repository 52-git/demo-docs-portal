# app/api/

## 概要
FastAPI の REST API 実装です。`/api` 配下に v1 ルータを集約し、管理画面向けの CRUD と運用系 API を提供します。

## 共通仕様
- 一覧取得は `_page` / `_limit` / `_sort` / `_order` を受け取り、`X-Total-Count` ヘッダで総件数を返します。
- `isActive` のような真偽値は `true/false`, `1/0` を許容する変換を行います。
- ID 未指定の場合はテーブル内容をスキャンして連番 ID を生成します（例: `dept001`）。

## エンドポイント一覧（抜粋）
### 管理系 CRUD
- `admins`: 管理者テーブル（`ADMIN_TABLE_NAME`）。
  - ID 例: `admin001`
- `departments`: 部署テーブル（`DEPARTMENT_TABLE_NAME`）。
  - ID 例: `dept001`
- `answer-areas`: 回答表示エリア（`ANSWER_AREA_TABLE_NAME`）。
  - ID 例: `AD001`
- `external-services`: 外部サービス（`EXTERNAL_SERVICE_TABLE_NAME`）。
  - ID 例: `ES001`
- `ext-resources`: 外部サービスのリソース（`EXT_RESOURCE_TABLE_NAME`）。
  - ID 例: `ER001`
- `ext-connections`: 外部サービス接続（`EXT_CONNECTION_TABLE_NAME`）。
  - ID 例: `EC001`
  - `POST /ext-connections/test` で API キー接続テストを実行。
- `knowledge-sources`: ナレッジソース（`KNOWLEDGE_SOURCE_TABLE_NAME`）。
  - ID 例: `KS001`

### ユーザー
- `GET /api/users`: 一覧取得（`department` フィルタ対応）。
- `GET /api/users/{user_id}`: 詳細。
- `GET /api/users/email/{email}`: メールアドレス検索。
- `POST /api/users/sync`: Microsoft Graph から全量同期。
- `POST /api/users/sync/{user_id}`: 単一ユーザー同期。
- `GET /api/users/stats`: 同期統計。
- `GET /api/users/{user_id}/photo`: 写真 URL の取得。
- `GET /api/users/{user_id}/photo/raw`: S3 から画像バイナリを返却。

### Secrets
- `GET /api/secrets`: Secrets Manager 一覧。
- `GET /api/secrets/{secret_id}`: 取得。
- `POST /api/secrets`: 作成。
- `PUT /api/secrets/{secret_id}`: 更新。
- `DELETE /api/secrets/{secret_id}`: 削除（`force`/`recovery_days` 対応）。

## ルータ構成
`app/api/v1/router.py` が各エンドポイントを `/api` 配下に統合します。
