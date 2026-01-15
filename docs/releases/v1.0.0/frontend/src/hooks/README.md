# src/hooks/

## 概要
画面共通のユーティリティフックと fetch ヘルパーを提供します。

## 主なフック
- `useIpRestriction.ts`: IP ホワイト/ブラックリスト判定。
  - `VITE_IP_CHECK_ENDPOINT` があればその API を使用。
  - 未指定の場合は `https://api.ipify.org` を使用。
- `useFetch.ts`: `getJSON` / `swrFetcher` の簡易ラッパー。
