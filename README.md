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
npm test
npm run lint
npm run build
```

## デプロイ

Railway のWebサービスとPostgreSQLサービスを同一プロジェクトに作成し、Webサービスへ次の変数を設定します。

- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `CONTACT_HASH_SALT=<random secret>`
- `NEXT_PUBLIC_SITE_URL=https://himawari-fc.jp`（DNS・HTTPSの開通確認後に設定）

`railway.json` にビルド、起動、ヘルスチェック設定を含みます。

独自ドメインの切り替え手順は `docs/custom-domain.md` を参照してください。

## 問い合わせメール

窓口は `info@himawari-en-jp.com`。Google WorkspaceのGmail APIで施設通知とお客様への自動返信を行い、受付後は `/contact/thanks` へ移動します。設定前はメール送信を無効にし、既存のDB保存を維持します。

既存メールはMicrosoft 365宛てのため、DNSの切り替え前に移行範囲の確認が必要です。認証・DNS・本番有効化・配信エラー対応は `docs/contact-mail.md` を参照してください。
