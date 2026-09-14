# 問い合わせメール・Google Workspace連携

## 対象と現在の状態

- サイト: https://himawari-fc.jp
- 施設への通知先・自動返信の差出人・お客様からの返信先: `info@himawari-en-jp.com`
- 2026年9月15日の公開DNS確認では、メールドメインのMXは `0 himawarienjp-com02j.mail.protection.outlook.com.`、SPFは `v=spf1 include:spf.protection.outlook.com -all`。ネームサーバーはムームーDNS。
- 2026年9月15日、利用者が `totono-niwa.com` の組織への追加を承認。過去メールの移行は不要で、完全に新しいメールとして運用する指示を受領。Microsoft 365の契約やデータ自体を削除・解約する依頼ではないため、そちらには手を加えない。
- Google Workspaceへ `himawari-en-jp.com` をセカンダリドメインとして追加し、Googleの所有権確認コードが表示されるところまで完了。DNSの所有権確認とGmail有効化は未完了。
- 現在ログイン中のムームードメインで対象を検索すると「対象のドメインはありません」と表示される。`himawari-fc.jp` は存在するが別のドメインであり変更しない。`himawari-en-jp.com` を管理するアカウントへのログイン待ち。確認用TXT・MX・SPFはまだ変更していない。
- 独立した受信箱を用意するためのユーザー追加は、ライセンス料金と利用者の承認を確認してから行う。Google認証情報も未作成。RailwayのCLIと接続アプリは再認証待ち。本番の送信機能はまだ有効化していない。

## サイトの実装

1. POST `/api/contact` で入力検証・サイズ制限・連続送信制限を実施。
2. 問い合わせ本文と、施設通知・お客様自動返信の送信待ちレコードを同一トランザクションでPostgreSQLに保存する。ブラウザーが同じ送信キーで再試行しても重複保存・重複通知しない。
3. 個人情報を含まない署名付きHttpOnly Cookie（1時間）を発行し、`/contact/thanks` へ移動する。未送信での直接訪問はフォームへ戻す。検索対象外。URLに氏名・メール・相談内容を入れない。
4. 常駐Nodeサーバーが30秒ごとに送信待ちを処理し、Google WorkspaceのGmail APIで送る。メール未設定時はDB保存のみを維持し、自動返信を送信したとは表示しない。未設定期間や過去の問い合わせを自動で一斉送信しない。
5. 施設への通知は全入力項目を含み、Reply-Toをお客様にする。自動返信は受付番号・受付日時・2〜3営業日の連絡目安・予約未確定・追加連絡方法を案内する。誤入力や悪用時の情報漏えいを抑えるため、個別相談・学校名等は自動返信に載せない。

## Google Workspaceの準備（管理者）

1. 今回の運営主体のGoogle Workspaceを選ぶ。未契約なら契約主体・プラン・課金を利用者が決定する。別クライアントの組織へ無断でドメインを追加しない。
2. 管理コンソールで `himawari-en-jp.com` を追加し、表示された固有のTXT値をムームーDNSに追加して所有権確認。サイト用 `himawari-fc.jp` のALIAS/TXTは変更しない。
3. Google側に `info@himawari-en-jp.com` のGmail利用可能なユーザーを用意する。単なるグループでAPI認証はできない。別ユーザーのエイリアスにする場合は、差出人として利用できることを先に確認する。
4. 他の利用中アドレスもGoogle側に用意し、必要な過去メールを移行する。移行期間中はMicrosoft 365契約・データを残す。
5. 切り替え日時の合意後にGoogleの管理画面が示すMXへ切り替える（新規設定の通常値は優先度1 `smtp.google.com`）。Google側でGmailを有効化する。
6. SPFは1レコードにまとめ、移行期間中にMicrosoftとGoogleの両方から送るなら両方を許可する。Googleのみの運用になった時点で `v=spf1 include:_spf.google.com ~all` へ整理する。他の送信元の有無も確認する。
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
- 送信中のタイムアウト、5xx、サーバー再起動で受付結果が不明な場合は `uncertain`。**自動再送しない。** Gmailの送信済みと `Message-ID: <hf-受付ID-staffまたはcustomer@himawari-en-jp.com>` を確認してから、管理者が再送要否を判断する。
- 送信待ち・失敗は管理者がDBで確認する。別途アラート基盤の導入はまだ行っていない。問い合わせ内容・認証トークンをエラーログに出さない。
- 送信待ち処理は100件/時・500件/日の安全上限を設ける。メールアドレスあたり3問い合わせ/時、IPあたり3問い合わせ/15分も制限する。大規模な攻撃対策には追加でCAPTCHA等を検討する。

## ローカル検証

- 33件の自動テスト: 入力検証、Cookie署名・期限、宛先/Reply-To、日本語MIME/HTMLエスケープ、機微情報を含まない自動返信、Gmailの障害分類、DB障害、二重送信防止を検証。
- 2026年9月15日、33件すべて成功。ESLint・型チェック・本番ビルド成功。完了ページのスマートフォン幅320/390pxとデスクトップ表示、横はみ出しなし、メールリンク、noindex、受付Cookieなしの直接アクセスがフォームへ戻ることを確認。本番への反映・実メールの送受信確認は未実施。
- PGliteのメモリー上PostgreSQLで、実際のDDLと問い合わせ・outboxトランザクション、送信待ちの取得、再試行・配信結果不明・プロセス中断時の処理を検証。Google送信部分はモックで、外部へメールを送らない。
- Windows環境のnpmでRollupまたはNext.js SWCの任意バイナリが欠落する場合は、ロックファイルの対応バージョンを確認し、公式npmのWindows用パッケージをローカルの `node_modules` に配置して検証する。Linux用の本番設定は変更しない。
- 完了ページの表示確認には `scripts/preview-thanks.mjs` を使用できる。同じテスト用 `CONTACT_HASH_SALT` を指定したNextサーバーを `127.0.0.1:3012` で起動後、プレビュースクリプトを起動し `http://127.0.0.1:3013/contact/thanks` を開く。DB保存・メール送信を伴わない表示専用であり、本番へ起動・公開しない。

参考: [GoogleのMX設定](https://support.google.com/a/answer/6156494)、[SPF](https://support.google.com/a/answer/33786)、[Gmail API送信](https://developers.google.com/workspace/gmail/api/guides/sending)、[OAuth更新トークン](https://developers.google.com/identity/protocols/oauth2)、[RailwayのSMTP制限](https://docs.railway.com/networking/outbound-networking)
