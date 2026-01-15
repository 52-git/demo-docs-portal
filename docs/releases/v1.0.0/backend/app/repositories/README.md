# app/repositories/

## 概要
データアクセスと検索インデックスを担当します。DynamoDB からの読み込みを最小化するため、キャッシュや FAISS を活用します。

## 主なリポジトリ
- `knowledge_index.py`
  - DynamoDB の埋め込みテーブルをストリーミング走査し FAISS を構築。
  - `search_with_text` でベクトル検索 + テキスト取得。
  - `query_by_vector` は旧仕様互換の検索ラッパ。
- `improvement_index.py`
  - 改善用の埋め込みテーブルを FAISS 化して検索。
- `department_catalog.py`
  - 部署一覧を TTL 付きでキャッシュ。
- `level_catalog.py`
  - レベル ID と名称を双方向にキャッシュ。
- `user_catalog.py`
  - Microsoft Graph 同期用のユーザー CRUD/集計。
- `continuation_store.py`
  - 継続回答のカーソル生成/保存/削除。

## 使い方のポイント
- `KnowledgeIndex.start_background()` / `ImprovementIndex.start_background()` を使い、起動時に非同期でインデックスを構築します。
- `DepartmentCatalog`/`LevelCatalog` は TTL キャッシュのため、変更反映には `reload()` が必要です。
