# 問い合わせメール設定（ロリポップへ移行準備中）

## 対象と現在の状態

- サイト: https://himawari-fc.jp
- 施設への通知先・自動返信の差出人・お客様からの返信先: `info@himawari-fc.jp`
- 2026年9月15日、利用者がメール用ドメインをサイトと同じ `himawari-fc.jp` に変更するよう指示。旧候補の `himawari-en-jp.com` は使用しない。
- 旧候補について、この作業で追加した未確認のWorkspaceドメイン登録のみ解除済み。メールユーザーやGoogle Sites等のデータは作成していなかった。ドメイン契約や旧候補のDNSは変更していない。
- 当初は利用者が承認した `totono-niwa.com` のGoogle Workspace組織で管理する方針だったが、2026年9月15日に追加ユーザー料金を避けるため既存のロリポップ契約を利用する方針に変更。過去メールの移行は不要。旧候補のドメイン契約やMicrosoft 365には手を加えない。
- `himawari-fc.jp` をセカンダリドメインとして追加し、ムームーDNSにGoogle確認用TXTを追加。Googleの「ドメイン所有権の確認が完了しました」を確認済み。
- Google側の `info@himawari-fc.jp` ユーザーは、一度利用者が追加課金を承認したため作成済み。方針変更後は未使用の追加ユーザーを取り消す対象だが、**まだ削除していない**。Google管理コンソールが再本人確認を要求している。削除前にデータ有無と請求の扱いを確認し、既存の `info@totono-niwa.com` や組織全体の契約を削除・解約しない。
- ロリポップの既存契約がハイスピードであることを確認。契約は自動更新設定済みであり、この作業で更新・プラン変更・新規課金はしていない。
- ロリポップに `himawari-fc.jp` を追加し、公開フォルダは他サイトと分離する `himawari-fc-mail` を指定。Webサイト移転やネームサーバーの一括変更はしていない。ドメイン登録に伴い `info@himawari-fc.jp` が作成され、20GB・使用量0・メール0件・転送先なし・受信停止未設定を確認した。パスワード変更画面を用意し、パスワード設定は利用者の操作待ち。既存の他ドメインのメールは変更していない。
- ムームーDNSの設定1は **ルートドメインの「メール」およびSPFだけ「ロリポップ！」** に変更。ホームページ・www・ml・mmは変更なし。設定2のWeb用ALIAS `ct8m36st.up.railway.app`、`_railway-verify` TXT、Google所有権確認用TXTは保持。
- DNSの受信先 `MX 50 mx01.lolipop.jp` をムームーのDNSサーバーとCloudflare DNSから確認。SPFは `v=spf1 include:_spf.lolipop.jp ~all`。Google DNSのMXは変更前のキャッシュが残っていた。設定後のWebサイトHTTP 200も確認済み。DKIM・DMARCと実メール送受信は未検証。
- サイトコードの送信部分はまだGmail API方式のまま。**ロリポップ環境向けの送信方式への変更・送受信テスト・本番反映は未完了**。Google認証情報は未作成。RailwayのCLIと接続アプリは前回確認時に再認証待ち。本番の送信機能はまだ有効化していない。

## ロリポップでの残作業

1. 利用者が専用メールのパスワードを管理画面で設定する。秘密値をチャット・GitHubに記載しない。
2. Webメールでログインし、指定された管理者のテストアドレスとの送受信を確認する。受信箱にあることとメールサーバーが受理したことを区別する。
3. 管理画面の接続情報は、アカウント `info@himawari-fc.jp`、IMAP `imap.lolipop.jp:993`、SMTP `smtp.lolipop.jp:465`。暗号化して利用する。実際の送信元に合わせてDKIM・DMARCを設定・検証する。
4. Railwayの現在のプランと送信制限を確認し、追加料金のない送信方法を選ぶ。SMTP接続できることを未確認のまま前提にしない。別サービスや新たな常駐サーバー・公開メール中継を無断で追加しない。
5. 以下の既存outbox・重複防止・確認ページ・個人情報保護を保ったまま送信アダプターを変更し、テスト後に反映する。ロリポップの受信メールすべてに対する自動返信を、フォーム固有の確認メールの代わりに無条件で有効にしない。
6. Google管理者の本人確認後に、追加したGoogleユーザーだけの削除を確認する。削除の完了と追加ライセンスの請求状態を確認するまで「追加課金は停止した」と報告しない。

以下のGoogle Workspace準備・Gmail API認証手順は既存実装の参考であり、**現在の採用方針では実行しない**。

## サイトの実装

1. POST `/api/contact` で入力検証・サイズ制限・連続送信制限を実施。
2. 問い合わせ本文と、施設通知・お客様自動返信の送信待ちレコードを同一トランザクションでPostgreSQLに保存する。ブラウザーが同じ送信キーで再試行しても重複保存・重複通知しない。
3. 個人情報を含まない署名付きHttpOnly Cookie（1時間）を発行し、`/contact/thanks` へ移動する。未送信での直接訪問はフォームへ戻す。検索対象外。URLに氏名・メール・相談内容を入れない。
4. 常駐Nodeサーバーが30秒ごとに送信待ちを処理し、Google WorkspaceのGmail APIで送る。メール未設定時はDB保存のみを維持し、自動返信を送信したとは表示しない。未設定期間や過去の問い合わせを自動で一斉送信しない。
5. 施設への通知は全入力項目を含み、Reply-Toをお客様にする。自動返信は受付番号・受付日時・2〜3営業日の連絡目安・予約未確定・追加連絡方法を案内する。誤入力や悪用時の情報漏えいを抑えるため、個別相談・学校名等は自動返信に載せない。

## Google Workspaceの準備（管理者）

1. 今回の運営主体のGoogle Workspaceを選ぶ。未契約なら契約主体・プラン・課金を利用者が決定する。別クライアントの組織へ無断でドメインを追加しない。
2. 管理コンソールに `himawari-fc.jp` をセカンダリドメインとして追加し、固有のTXTで所有権確認（完了済み）。Web用のALIASとRailway確認用TXTは変更しない。
3. Google側に `info@himawari-fc.jp` のGmail利用可能なユーザーを用意する。単なるグループでAPI認証はできない。別ユーザーのエイリアスにする場合は、差出人として利用できることを先に確認する。
4. 今回は新規運用で過去メールの移行なし。専用受信箱を作成する前に追加ライセンス料金を確認する。
5. 切り替え日時の合意後にGoogleの管理画面が示すMXへ切り替える（新規設定の通常値は優先度1 `smtp.google.com`）。Google側でGmailを有効化する。
6. Googleだけから送信する場合、SPFは `v=spf1 include:_spf.google.com ~all` を1レコードだけ追加する。設定時に既存のSPFや他の送信元がないか再確認する。
7. 管理画面で対象ドメインのDKIMを生成し、指定されたTXTをDNSに追加して認証開始。DMARCは既存設定・全送信元の確認後に導入する。未確認のまま厳格なreject設定にしない。
8. 外部アドレスとの送受信、Gmailのメール原文でSPF/DKIM/DMARC、実際の受信箱・迷惑メールを確認する。

## Gmail APIの認証

RailwayではSMTPがプラン制限を受けるため、HTTPSのGmail APIを使用する。追加のメール配送サービス契約は不要だが、Workspaceアカウントの送信制限は適用される。

1. 利用者の管理下のGoogle Cloudプロジェクトを用意し、Gmail APIを有効化する。
2. Google Auth Platformの同意画面を設定する。Workspace組織の内部アプリが利用できる場合は内部向けとし、**送信のみ**の `https://www.googleapis.com/auth/gmail.send` を使う。メールの読み取り・削除権限や組織全体の代理権限は不要。
3. OAuthクライアントを作成し、管理用の安全なOAuth認証フローで対象メールボックスのユーザーが一度だけ承認する。`access_type=offline` を指定してrefresh tokenを取得する。外部アプリの「テスト中」はGmailのrefresh tokenが7日で失効するため、本番運用前に公開状態・確認要件を整理する。
4. 取得した秘密値をRailwayのVariablesに保存する。チャット、GitHub、ブラウザーのJavaScript、`NEXT_PUBLIC_*` 変数には記載しない。

| 変数 | 値 |
| --- | --- |
| `GOOGLE_MAIL_CLIENT_ID` | OAuthクライアントID |
| `GOOGLE_MAIL_CLIENT_SECRET` | OAuthクライアントの秘密値 |
| `GOOGLE_MAIL_REFRESH_TOKEN` | 送信アカウントが承認した更新トークン |
| `CONTACT_MAIL_ENABLED` | 送信テストまでは `false`、準備完了後に `true` |
| `CONTACT_HASH_SALT` | 既存の十分に長い秘密値。受付Cookie署名にも使用 |

Googleログイン用パスワードはアプリに保存しない。認証の失効・取り消し時は再承認が必要。

## 本番反映・動作確認

- `npm test`、`npm run lint`、`npm run build` を実行。
- Railwayへ再ログインし、既存 `himawari-web` サービスの `production` に反映する。DBは既存のPostgresを継続使用。既存問い合わせを削除・移行しない。
- **アプリのスリープを無効にする。** この実装は `next start` の常駐プロセスで送信待ちを処理する。serverlessへ移す場合は先に専用の定期実行ワーカーへ変更する。
- 有効化前に対象受信箱と送信認証を確認し、管理者のテスト受信先を決める。架空の第三者や実在のお客様をテスト先にしない。
- 同じテスト問い合わせについて、DB保存が1件、outboxが2件、施設通知の受信、お客様確認メールの受信、Reply-To、文字化け・迷惑メール、サンキューページ、ブラウザー再試行時の重複なしを確認する。
- 「Googleが受理した」ことと「受信箱に届いた」ことを区別する。最後は実際のメールボックスで確認する。

## 配信エラーの運用

`contact_mail_outbox.status`: `pending` / `processing` / `retry` / `sent` / `failed` / `uncertain`。

- 認証の一時的な通信障害と明確な429応答は、待機時間を延ばして最大5回試行する。
- 認証の恒久エラーは `failed`。まず認証を修復してから該当分だけ再処理する。
- 送信中のタイムアウト、5xx、サーバー再起動で受付結果が不明な場合は `uncertain`。**自動再送しない。** Gmailの送信済みと `Message-ID: <hf-受付ID-staffまたはcustomer@himawari-fc.jp>` を確認してから、管理者が再送要否を判断する。
- 送信待ち・失敗は管理者がDBで確認する。別途アラート基盤の導入はまだ行っていない。問い合わせ内容・認証トークンをエラーログに出さない。
- 送信待ち処理は100件/時・500件/日の安全上限を設ける。メールアドレスあたり3問い合わせ/時、IPあたり3問い合わせ/15分も制限する。大規模な攻撃対策には追加でCAPTCHA等を検討する。

## ローカル検証

- 34件の自動テスト: 入力検証、Cookie署名・期限、宛先/Reply-To、日本語MIME/HTMLエスケープ、機微情報を含まない自動返信、Gmailの障害分類、DB障害、二重送信防止、差出人・返信先・Message-IDのドメイン統一を検証。
- 2026年9月15日、34件すべて成功。ESLint・型チェック・本番ビルド成功。完了ページのスマートフォン幅320/390pxとデスクトップ表示、横はみ出しなし、メールリンク、noindex、受付Cookieなしの直接アクセスがフォームへ戻ることを確認。本番への反映・実メールの送受信確認は未実施。
- PGliteのメモリー上PostgreSQLで、実際のDDLと問い合わせ・outboxトランザクション、送信待ちの取得、再試行・配信結果不明・プロセス中断時の処理を検証。Google送信部分はモックで、外部へメールを送らない。
- Windows環境のnpmでRollupまたはNext.js SWCの任意バイナリが欠落する場合は、ロックファイルの対応バージョンを確認し、公式npmのWindows用パッケージをローカルの `node_modules` に配置して検証する。Linux用の本番設定は変更しない。
- 完了ページの表示確認には `scripts/preview-thanks.mjs` を使用できる。同じテスト用 `CONTACT_HASH_SALT` を指定したNextサーバーを `127.0.0.1:3012` で起動後、プレビュースクリプトを起動し `http://127.0.0.1:3013/contact/thanks` を開く。DB保存・メール送信を伴わない表示専用であり、本番へ起動・公開しない。

参考: [GoogleのMX設定](https://support.google.com/a/answer/6156494)、[SPF](https://support.google.com/a/answer/33786)、[Gmail API送信](https://developers.google.com/workspace/gmail/api/guides/sending)、[OAuth更新トークン](https://developers.google.com/identity/protocols/oauth2)、[RailwayのSMTP制限](https://docs.railway.com/networking/outbound-networking)
