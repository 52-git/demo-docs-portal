# src/pages/

## 概要
画面単位のコンポーネント群です。`App.tsx` のルーティングに対応しています。

## 一覧
- `ChatPage.tsx`: メインのチャット UI。
- `DepartmentsPage.tsx`: 部署 CRUD。
- `AdminsPage.tsx`: 管理者 CRUD。
- `ExternalServicesPage.tsx`: 外部サービス CRUD。
- `AnswerAreasPage.tsx`: 回答表示エリア CRUD。
- `ExtResourcesPage.tsx`: 外部リソース CRUD。
- `ExtConnectionsPage.tsx`: 外部接続 CRUD + テスト。
- `KnowledgePage.tsx`: ナレッジソース CRUD。
- `LoginPage.tsx`: Cognito SSO ログイン。
- `AuthCallback.tsx`: Cognito コールバック。
- `IpRestrictedPage.tsx`: IP 制限時の案内画面。

## データ取得の特徴
多くの CRUD 画面は `GET /api/*` を `_page`/`_limit` 付きで呼び出し、`X-Total-Count` を用いてページングします。
