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

## 2026年9月15日時点の準備状況

- Railwayへ独自ドメインを追加済み。
- ムームーDNSのカスタム設定にALIAS/TXTを追加済み。ネームサーバーはdns01/dns02.muumuu-domain.com。
- Google/CloudflareのDNSで反映確認済み。RailwayでもDNS反映を確認済み。
- HTTPS開通と本番公開URLの切り替えは証明書発行待ち。
- 従来のRailway URLは引き続き稼働する。
- 新URLを指定したローカルのlint・本番ビルドは成功。トップ/プライバシーポリシーのcanonical、OG画像、robots.txt、sitemap.xml、旧ホストからの308転送（パス・クエリ維持）、フォームの空入力検証400を確認済み。

参考: [Railwayのドメイン設定](https://docs.railway.com/networking/domains/working-with-domains)、[ムームーDNSカスタム設定](https://support.muumuu-domain.com/hc/ja/articles/360046453854)
