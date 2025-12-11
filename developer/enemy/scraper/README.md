# エネミーデータスクレイピングツール

ログホライゾン TRPG 公式サイトからエネミーデータを取得し、特技のマスターデータを生成します。

## セットアップ

```bash
# 依存パッケージのインストール
pip install -r requirements.txt
```

## 使用方法

```bash
# スクレイピング実行
python fetch_enemy_skills.py
```

## 出力ファイル

-   `../json/enemy_master.json` - 全エネミーデータ
-   `../json/enemy_skills.json` - ユニーク特技マスターデータ

## 設定

`fetch_enemy_skills.py` 内の定数で調整可能：

-   `START_ID` - 開始 ID（デフォルト: 0）
-   `END_ID` - 終了 ID（デフォルト: 5000）
-   `MAX_WORKERS` - 並列リクエスト数（デフォルト: 10）
-   `REQUEST_TIMEOUT` - タイムアウト秒数（デフォルト: 5）
-   `RETRY_COUNT` - リトライ回数（デフォルト: 3）

## 注意事項

-   公式サーバーに負荷をかけないよう、適切な並列数とタイムアウトを設定してください
-   大量のリクエストを行うため、実行には数分かかります
-   404 エラーは正常（存在しない ID のため）
