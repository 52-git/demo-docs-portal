# app/tasks/

## 概要
DynamoDB に定義したジョブを APScheduler で実行する仕組みです。複数インスタンスでも重複実行を避けるため、DDB で分散ロック（リース）を取得します。

## 仕組み
- `JOBS_TABLE` から有効ジョブをスキャン。
- `cron_expr`/`timezone` に従ってスケジューラ登録。
- 実行前に `lease_expires_at` を条件更新して排他取得。
- 実行結果を `last_run_at` / `last_duration_ms` に記録。

## 代表的な action
- `IMPORT_TO_S3`: 外部ソース同期。
- `S3_TO_DDB`: 埋め込み生成。
- `RELOAD_INDEX`: インメモリインデックスの再構築。
- `SYNC_MICROSOFT_USERS`: Microsoft Graph 同期。

## ジョブ定義の例（イメージ）
```
job_id: "import-nightly"
enabled: true
cron_expr: "0 2 * * *"
timezone: "Asia/Tokyo"
action: "IMPORT_TO_S3"
payload: {}
version: 1
updated_at: 1730000000
```

## 注意点
- `ENABLE_DDB_SCHEDULER=true` で有効化されます。
- `RELOAD_INDEX` は `init_ddb_scheduler(reload_callable=...)` が必須です。
