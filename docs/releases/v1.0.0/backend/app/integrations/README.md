# app/integrations/

## 概要
外部サービスや LLM との統合レイヤです。チャット入力を受けてプロンプト構築 → ストリーミング回答 → 参照/継続情報を扱います。

## chat/
- `socketio.py`: Web 向け Socket.IO 実装。
  - `chat` イベントで埋め込み検索 → レベル別回答をストリーム配信。
  - 回答末尾をもとに継続カーソルを生成し、継続用データを保存。
- `teams.py`: Microsoft Teams (Bot Framework) 連携。
  - Adaptive Card で複数セクションを表示。
  - 「続き」ボタンで継続回答を実行。
  - ユーザー選択の部署/モデルをセッションに保持。
- `common.py`: 参照表示や継続判定、DONE マーカーなどの共通処理。
- `ws.py`: 旧来の WebSocket 実装（必要に応じて拡張）。

## llm/
- `prompt_builder.py`: ナレッジ検索結果からプロンプトを構築。
- `models.py`: `SUPPORTED_AI_MODELS`/`DEFAULT_AI_MODEL` の正規化。
- `gpt_client.py`: OpenAI GPT ストリーミング。
- `claude_client.py`: Anthropic Claude ストリーミング。
- `gemini_client.py`: Google Gemini ストリーミング。
- `bedrock_client.py`: Bedrock で埋め込み生成（Titan Embed）。

## 利用する環境変数（主）
- `SUPPORTED_AI_MODELS`, `DEFAULT_AI_MODEL`, `MAX_COMPLETION_TOKENS`
- `OPENAI_API_KEY`, `CLAUDE_API_KEY`, `GEMINI_API_KEY`
- `AWS_REGION`（Bedrock / DDB / S3）
