# src/auth/

## 概要
認証状態とユーザー情報を保持するコンテキストです。Cognito からのログイン結果を保存し、ヘッダーやアバター表示に利用します。

## AuthContext の主な機能
- `isAuthenticated` と `user` の保持（localStorage）。
- `sessionId` の保持（SSO ポーリング用）。
- 画像の遅延取得: `/api/users/{id}/photo/raw` を取得し data URL 化。

## 関連ページ
- `pages/LoginPage.tsx`: Cognito ログイン開始。
- `pages/AuthCallback.tsx`: Cognito コールバック処理。
