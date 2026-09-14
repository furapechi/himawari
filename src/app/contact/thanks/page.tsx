import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, Mail, Phone, Clock } from "@/components/Icons";
import { CONTACT_EMAIL, CONTACT_HOURS, CONTACT_PHONE } from "@/lib/contact-config";
import { readReceipt, RECEIPT_COOKIE } from "@/lib/contact-receipt";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "お問い合わせありがとうございます",
  description: "ひまわりFCへのお問い合わせを受け付けました。今後のご案内をご確認ください。",
  robots: { index: false, follow: false },
  alternates: { canonical: "/contact/thanks" },
};

export default async function ThanksPage() {
  const receipt = readReceipt((await cookies()).get(RECEIPT_COOKIE)?.value);
  if (!receipt) redirect("/#contact");
  return (
    <main className="thanks-page">
      <div className="thanks-shell">
        <Link className="legal-brand" href="/" aria-label="ひまわりFC トップページへ">
          <span className="brand-mark brand-mark-small" aria-hidden="true"><i /></span>
          <span><strong>ひまわりFC</strong><small>HIMAWARI FOOTBALL CLUB</small></span>
        </Link>
        <article className="thanks-card">
          <div className="thanks-check"><Check /></div>
          <p className="thanks-kicker">THANK YOU</p>
          <h1><span>お問い合わせ</span><span>ありがとうございます。</span></h1>
          <p className="thanks-lead">お送りいただいたお問い合わせを受け付けました。<br />お子さまとご家族に寄り添い、<br className="thanks-mobile-break" />一つひとつ丁寧にお返事いたします。</p>
          <div className="thanks-reference"><span>お問い合わせ受付番号</span><strong>{receipt.reference}</strong><small>ご連絡の際にお知らせいただくとスムーズです。</small></div>
          <div className="thanks-next">
            <h2>このあとのご案内</h2>
            <section><span className="thanks-step">01</span><div><h3><Mail />受付確認メール</h3><p>{receipt.mailQueued ? <>ご入力のアドレスへ受付確認メールを自動でお送りします。届かない場合は、迷惑メールフォルダや受信設定もご確認ください。</> : <>現在、自動返信メールはお送りしていません。お問い合わせは受け付けておりますので、受付番号をお控えください。</>}</p></div></section>
            <section><span className="thanks-step">02</span><div><h3><Clock />担当者からのご連絡</h3><p>通常<strong>2〜3営業日以内</strong>を目安に、ご希望の連絡方法でご連絡します。日曜日・年末年始などの休業日を挟む場合は、お時間をいただくことがございます。</p></div></section>
            <p className="thanks-note">※見学・体験の日程は、担当者とのご相談後に確定します。<br />※3営業日を過ぎても連絡がない場合や、お急ぎの場合は、お電話でお問い合わせください。</p>
          </div>
          <div className="thanks-contact"><a href="tel:0471570389"><Phone />{CONTACT_PHONE}</a><p>{CONTACT_HOURS}</p><a className="thanks-mail" href={`mailto:${CONTACT_EMAIL}`}><Mail />{CONTACT_EMAIL}</a></div>
          <Link className="button button-primary thanks-home" href="/">トップページへ戻る<ArrowRight /></Link>
        </article>
        <p className="thanks-footer">ひまわりFC ／ ベル不動産企画株式会社</p>
      </div>
    </main>
  );
}
