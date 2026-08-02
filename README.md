# ひまわりFC 公式サイト

児童発達支援・放課後等デイサービス「ひまわりFC」のリニューアルサイトです。

## ローカル開発

```bash
npm install
npm run dev
```

問い合わせを保存するには PostgreSQL を用意し、`.env.local` に `DATABASE_URL` と `CONTACT_HASH_SALT` を設定してください。DBテーブルは初回ヘルスチェックまたは問い合わせ時に安全に作成されます。

## 検証

```bash
npm run build
```

## デプロイ

Railway のWebサービスとPostgreSQLサービスを同一プロジェクトに作成し、Webサービスへ次の変数を設定します。

- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `CONTACT_HASH_SALT=<random secret>`
- `NEXT_PUBLIC_SITE_URL=https://<railway-domain>`

`railway.json` にビルド、起動、ヘルスチェック設定を含みます。
