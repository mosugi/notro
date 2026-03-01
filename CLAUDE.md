# notro-tail

## Vercel プロジェクト設定

### 環境変数に設定する値

Claude Code on the Web の環境変数（Settings > Environment Variables）に以下を追加してください：

| 変数名 | 値の取得元 |
|---|---|
| `VERCEL_PROJECT_ID` | Vercel プロジェクトの Settings > General |
| `VERCEL_ORG_ID` | Vercel チームの Settings > General |
| `VERCEL_TOKEN` | vercel.com/account/tokens で発行した PAT |

> `VERCEL_OIDC_TOKEN` は Vercel 基盤が自動でセットするため、手動設定不要。
> ただし Vercel 自身の REST API には使えない（外部サービス向け OIDC トークンのため）。
> Vercel API を叩くには `VERCEL_TOKEN`（Personal Access Token）が必要。

### Vercel API の使い方

環境変数が設定済みであれば、以下のコマンドで各種情報を取得できます。

#### 最新デプロイ一覧

```bash
curl -s "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&teamId=$VERCEL_ORG_ID&limit=5" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -m json.tool
```

#### 最新デプロイのビルドログ取得

```bash
# まずデプロイIDを取得
DEPLOY_ID=$(curl -s "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&teamId=$VERCEL_ORG_ID&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['deployments'][0]['uid'])")

# ビルドログを取得
curl -s "https://api.vercel.com/v2/deployments/$DEPLOY_ID/events?teamId=$VERCEL_ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -m json.tool
```

#### デプロイのステータス確認

```bash
curl -s "https://api.vercel.com/v13/deployments/$DEPLOY_ID?teamId=$VERCEL_ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('State:', d.get('readyState'))
print('URL:', d.get('url'))
print('Error:', d.get('errorMessage', 'none'))
"
```
