import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/Icons";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "ひまわりFCにおける個人情報の取り扱いについてご案内します。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-orb legal-orb-one" />
      <div className="legal-orb legal-orb-two" />
      <div className="legal-shell">
        <Link className="legal-brand" href="/" aria-label="ひまわりFC トップページへ">
          <span className="brand-mark brand-mark-small" aria-hidden="true"><i /></span>
          <span><strong>ひまわりFC</strong><small>HIMAWARI FOOTBALL CLUB</small></span>
        </Link>

        <article className="legal-card">
          <p className="section-kicker">PRIVACY POLICY</p>
          <h1>プライバシーポリシー</h1>
          <p className="legal-lead">
            ベル不動産企画株式会社（以下「当社」）は、児童発達支援・放課後等デイサービスの運営においてお預かりする個人情報を大切に取り扱います。
          </p>

          <section>
            <h2>1. 取得する情報</h2>
            <p>お問い合わせフォームを通じて、お名前、ふりがな、メールアドレス、電話番号、お子さまの年代、通学・通園先、ご相談内容、ご希望の連絡方法等を取得します。</p>
          </section>
          <section>
            <h2>2. 利用目的</h2>
            <ul>
              <li>見学、ご利用、支援内容等に関するお問い合わせへの回答</li>
              <li>ご希望に応じた連絡、日程調整および必要なご案内</li>
              <li>送迎可能範囲および送迎ルートの確認</li>
              <li>サービス品質およびウェブサイトの安全性向上</li>
              <li>法令に基づく対応</li>
            </ul>
          </section>
          <section>
            <h2>3. 第三者提供</h2>
            <p>法令に基づく場合、または生命・身体の保護のために緊急の必要がある場合を除き、ご本人の同意なく個人情報を第三者へ提供しません。</p>
          </section>
          <section>
            <h2>4. 安全管理</h2>
            <p>送信内容は暗号化された通信経路を通じて受け付け、アクセスを制限したデータベースで管理します。不正アクセス、紛失、漏えい等の防止に必要な措置を講じます。</p>
          </section>
          <section>
            <h2>5. 保存期間</h2>
            <p>取得した情報は、お問い合わせ対応および関連する記録管理に必要な期間保存し、目的を終えた情報は適切な方法で削除します。</p>
          </section>
          <section>
            <h2>6. 開示・訂正・削除</h2>
            <p>ご本人から個人情報の開示、訂正、利用停止または削除のお申し出があった場合、ご本人確認のうえ法令に従って対応します。</p>
          </section>
          <section>
            <h2>7. お問い合わせ窓口</h2>
            <p>
              ベル不動産企画株式会社　ひまわりFC<br />
              〒270-1151 千葉県我孫子市本町3-5-25 渋谷ビル2F<br />
              電話：<a href="tel:0471570389">04-7157-0389</a>
            </p>
          </section>
          <p className="legal-date">制定日：2026年8月3日<br />最終改定日：2026年8月20日</p>
        </article>

        <Link className="button button-primary legal-back" href="/">
          トップページへ戻る <ArrowRight />
        </Link>
      </div>
    </main>
  );
}
