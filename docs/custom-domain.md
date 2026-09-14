# himawari-fc.jp への切り替え

## 対象

- 正式URL: https://himawari-fc.jp
- 従来URL: https://himawari-web-production.up.railway.app
- Railway: `himawari-fc-renewal` / `production` / `himawari-web`
- Railway custom domain ID: `8344666d-2c3f-408e-8e51-a3dd6bed81aa`
- 転送先ポート: `3000`

## ムームーDNSの設定

2026年9月15日にRailwayが発行した値。DNSで公開するドメイン所有確認値であり、APIキーではありません。

ムームードメインへログインし、「ドメイン操作」→「ムームーDNS」→ `himawari-fc.jp` の「利用する」または「変更」→「カスタム設定」→「設定2」へ進む。

| サブドメイン | 種別 | 内容 |
| --- | --- | --- |
| 空欄 | ALIAS | `ct8m36st.up.railway.app` |
| `_railway-verify` | TXT | `railway-verify=9fb2bc4957d7b2622d3337d1b5ba1adfc83d41d8c78c003f4913d07f039ebc7b` |

- ルートドメインなのでCNAMEではなくALIASを使う。内容に `https://` や `/` は付けない。
- ムームーDNSがネームサーバーとして有効であることも確認する。
- 既存メール用MX/TXTなど、今回と無関係のレコードは維持する。
- 既存のA/AAAA/ALIASがあれば用途を確認したうえでWeb接続先を更新し、競合を残さない。
- ドメイン取得処理やネームサーバー反映が未完了なら、反映してから検証する。

## 開通確認後の本番切り替え

1. Railwayのドメイン状態で所有確認・DNS・証明書の成功を確認する。
2. `https://himawari-fc.jp/` と `/api/health` がHTTPSで正常応答することを確認する。
3. RailwayのWebサービスに `NEXT_PUBLIC_SITE_URL=https://himawari-fc.jp` を設定して再ビルド・デプロイする。DNS/TLS確認前には変更しない。
4. トップ・プライバシーポリシーのcanonical、OG画像URL、robots.txt、sitemap.xmlが新ドメインになっていることを確認する。
5. 従来URLのページが新URLへ308転送され、パス・クエリが維持されることを確認する。APIは移行中のフォーム送信やヘルスチェックを維持するため転送対象外。
6. 新ドメインのフォームの入力検証を確認する。実際の問い合わせデータをテスト用に保存しない。

## 2026年9月15日の切り替え結果

- Railwayへ独自ドメインを追加済み。
- ムームーDNSのカスタム設定にALIAS/TXTを追加済み。ネームサーバーはdns01/dns02.muumuu-domain.com。
- Google/CloudflareのDNSで反映確認済み。RailwayでもDNS反映を確認済み。
- Railwayでドメイン所有確認済み、SSL証明書は `CERTIFICATE_STATUS_TYPE_VALID`。
- 本番の `NEXT_PUBLIC_SITE_URL` を `https://himawari-fc.jp` に変更し、再ビルド・デプロイ成功。
- 最終デプロイID: `93121aa4-21ae-4f52-9d6b-4d7ee4c84f26`（`SUCCESS`）。
- 新ドメインのトップ・プライバシーポリシーはHTTPSで200。canonical、OG画像、robots.txt、sitemap.xmlは新ドメインを参照。
- ヒーロー画像、サッカーボールSVG、支援プログラムPDFは新ドメインで200。
- `/api/health` は200、データベース接続は `connected`。
- 新旧ドメインの `/api/contact` に空のJSONを送信し、入力検証400を確認。実際の問い合わせデータの保存テストは行っていない。
- 旧Railway URLのトップと `/privacy?from=domain-check` から新URLへの308転送を確認。パス・クエリを維持し、APIは転送対象外。
- ブラウザーでも旧URLの再読み込みにより `https://himawari-fc.jp/#access` へ移動し、ページ内の位置指定を維持してサイトと地図が表示されることを確認。
- サイトの内容・デザイン、メール設定は今回変更していない。ローカルのlint・本番ビルドも成功済み。

## 別途対応が必要な保守事項

切り替え時のビルドで依存パッケージの脆弱性警告を検出。`npm audit --omit=dev` でも `next`（critical）と `sharp`（high）を確認した。ドメイン変更とは別の更新作業として記録し、今回パッケージの更新は行っていない。

- [Next.jsのAVIF画像処理に関するセキュリティ情報](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4)：Next.js 15.5.24で修正。現在の15.5.22は影響範囲。
- [sharpのセキュリティ情報](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)：0.35.4未満に対する警告。
- Railway CLIは既存のConfig as Codeについて2026年12月1日まで動作すると通知している。将来の運用に向けた設定形式の移行も別途確認する。

参考: [Railwayのドメイン設定](https://docs.railway.com/networking/domains/working-with-domains)、[ムームーDNSカスタム設定](https://support.muumuu-domain.com/hc/ja/articles/360046453854)
