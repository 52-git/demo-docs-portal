# app/services/

## 概要
外部ソース取り込み、埋め込み生成、Microsoft Graph 同期などの長時間処理をまとめたレイヤです。

## import_to_s3.py
`SyncOrchestrator` が外部ソースを走査し、S3 と DATA_TABLE を同期します。
- 対応ソース: GitHub, Backlog（Wiki/Issue/Document/Shared File）, 既存 S3。
- `source` は `type||key` 形式で指定。
- `file_type`, `excluded_keywords`, `tags` でフィルタリング。
- `depts` を複数部署で保持し、削除時は部署単位で unlink。

## s3_to_dynamodb.py
`EmbedOrchestrator` が S3 を読み込み、埋め込みを EMBEDDING_TABLE に登録します。
- 対応形式: PDF/DOCX/PPTX/XLSX/XLS/TXT/MD/DOC/PPT。
- 大容量対策: ストリーミング読み込み、スプール、チャンク数上限。
- チャンクは `coarse` + `micro` で検索リコールを向上。

## microsoft_user_sync.py
Microsoft Graph API からユーザーを取得し `USER_TABLE_NAME` に同期します。
- 写真は `USER_PHOTO_S3_BUCKET` に保存し URL を保持。
- `sync_users`（全量）と `sync_single_user`（単体）に対応。
