"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Calendar,
  Chat,
  Check,
  ChevronDown,
  Clipboard,
  Clock,
  Close,
  Document,
  ExternalLink,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Palette,
  Phone,
  Send,
  Shield,
  SoccerBall,
  Sparkles,
  Train,
  Users,
} from "@/components/Icons";

const navItems = [
  { label: "私たちの支援", href: "#support" },
  { label: "活動プログラム", href: "#program" },
  { label: "ご利用案内", href: "#guide" },
  { label: "公開資料", href: "#documents" },
  { label: "アクセス", href: "#access" },
];

const pillars = [
  {
    number: "01",
    title: "コミュニケーション能力",
    text: "ボールや遊びをきっかけに、気持ちを伝えること、相手の思いに気づくこと、お友達とつながる楽しさを育みます。",
    icon: Chat,
    tone: "green",
  },
  {
    number: "02",
    title: "社会性",
    text: "ルールや役割を自然に学びながら、仲間と力を合わせる経験を重ね、集団の中で過ごす力につなげます。",
    icon: Users,
    tone: "coral",
  },
  {
    number: "03",
    title: "自己肯定感",
    text: "一人ひとりの小さな「できた！」を見逃さず、次の挑戦へ。自分のよさと可能性を感じられるよう支えます。",
    icon: Heart,
    tone: "yellow",
  },
];

const daySteps = [
  { label: "到着・健康確認", note: "安心して始められるよう、その日の様子を丁寧に確認します。", icon: Shield },
  { label: "個別・集団活動", note: "一人ひとりの目標に合わせ、遊びや課題に取り組みます。", icon: Sparkles },
  { label: "運動療育", note: "サッカーや運動遊びを通じて、心と身体をのびのび動かします。", icon: SoccerBall },
  { label: "おやつ・休憩", note: "気持ちを切り替え、ゆったり過ごす時間も大切にします。", icon: Clock },
  { label: "振り返り・送迎", note: "今日の達成を一緒に確かめ、次の自信へつなげます。", icon: Check },
];

const useSteps = [
  ["01", "お問い合わせ", "お電話またはフォームから、見学やご利用についてご相談ください。"],
  ["02", "見学・ご相談", "施設や活動をご覧いただき、お子さまの様子やご希望を伺います。"],
  ["03", "受給者証のお手続き", "お住まいの自治体で必要なお手続きを進めます。初めての方もご相談いただけます。"],
  ["04", "ご契約・支援計画", "目標を一緒に考え、一人ひとりに合わせた個別支援計画を作成します。"],
  ["05", "ご利用スタート", "安心して通える関係づくりから、ゆっくり始めます。"],
];

const faqs = [
  ["どのようなお子さまが利用できますか？", "児童発達支援は未就学のお子さま、放課後等デイサービスは就学中のお子さまが基本の対象です。ご利用には通所受給者証が必要です。対象や手続きについてもお気軽にご相談ください。"],
  ["サッカーをしたことがなくても大丈夫ですか？", "もちろん大丈夫です。技術の習得だけを目的にせず、ボールに触れる楽しさや身体を動かす心地よさから、一人ひとりのペースで始めます。"],
  ["送迎はありますか？", "送迎に対応しています。範囲や時間は、ご利用曜日やルートによって異なるため、見学・ご相談時にお住まいの地域や通園・通学先を伺ってご案内します。"],
  ["見学や相談だけでもできますか？", "はい。施設の雰囲気や活動をご覧いただいたうえで、ご家庭の希望や気になることをお聞かせください。ご利用を前提としないご相談も歓迎しています。"],
  ["利用料金はどのくらいですか？", "障害児通所支援の利用者負担は、原則としてサービス費の1割で、世帯所得に応じた月額上限があります。実費が必要な活動等も含め、個別に分かりやすくご説明します。"],
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ChildCare",
  name: "ひまわりFC",
  alternateName: "HIMAWARI FOOTBALL CLUB",
  description: "我孫子市の児童発達支援・放課後等デイサービス。サッカーを中心とした運動療育を提供しています。",
  telephone: "+81-4-7157-0389",
  address: {
    "@type": "PostalAddress",
    postalCode: "270-1151",
    addressRegion: "千葉県",
    addressLocality: "我孫子市",
    streetAddress: "本町3-5-25 渋谷ビル2F",
    addressCountry: "JP",
  },
  geo: { "@type": "GeoCoordinates", latitude: 35.87192, longitude: 140.011803 },
  sameAs: ["https://www.instagram.com/himawari._.fc/"],
  parentOrganization: { "@type": "Organization", name: "株式会社ひまわり園" },
};

function Brand() {
  return (
    <span className="brand-lockup">
      <span className="brand-mark" aria-hidden="true"><i /></span>
      <span className="brand-type">
        <strong>ひまわりFC</strong>
        <small>HIMAWARI FOOTBALL CLUB</small>
      </span>
    </span>
  );
}

function SectionHeading({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <div className="section-heading" data-reveal>
      <p className="section-kicker">{kicker}</p>
      <h2>{title}</h2>
      {lead ? <p className="section-lead">{lead}</p> : null}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [formState, setFormState] = useState<{
    type: "idle" | "sending" | "success" | "error";
    message?: string;
    reference?: string;
  }>({ type: "idle" });

  useEffect(() => {
    document.documentElement.classList.add("js");
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" },
    );
    items.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", String((index % 4) * 65) + "ms");
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setFormState({ type: "sending" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.get("name"),
          nameKana: fields.get("nameKana"),
          email: fields.get("email"),
          phone: fields.get("phone"),
          inquiryType: fields.get("inquiryType"),
          childAge: fields.get("childAge"),
          preferredContact: fields.get("preferredContact"),
          message: fields.get("message"),
          privacy: fields.get("privacy") === "on",
          website: fields.get("website"),
        }),
      });
      const body = (await response.json()) as { error?: string; reference?: string };
      if (!response.ok) throw new Error(body.error || "送信できませんでした。");

      form.reset();
      setFormState({
        type: "success",
        message: "お問い合わせを受け付けました。内容を確認のうえご連絡します。",
        reference: body.reference,
      });
    } catch (error) {
      setFormState({
        type: "error",
        message: error instanceof Error ? error.message : "送信できませんでした。",
      });
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <a className="skip-link" href="#main-content">本文へ移動</a>

      <header className="site-header">
        <div className="header-inner">
          <a className="header-brand" href="#top" aria-label="ひまわりFC トップへ"><Brand /></a>
          <nav className="desktop-nav" aria-label="メインナビゲーション">
            {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <div className="header-actions">
            <a className="instagram-link" href="https://www.instagram.com/himawari._.fc/" target="_blank" rel="noopener noreferrer" aria-label="Instagramを開く"><Instagram /></a>
            <a className="header-contact" href="#contact"><Mail /><span>見学・相談</span></a>
            <button className="menu-button" type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label="メニューを開く"><Menu /></button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className={"mobile-menu " + (menuOpen ? "is-open" : "")} aria-hidden={!menuOpen}>
        <div className="mobile-menu-head">
          <Brand />
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="メニューを閉じる"><Close /></button>
        </div>
        <nav aria-label="モバイルナビゲーション">
          {navItems.map((item, index) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{item.label}<ArrowRight /></a>
          ))}
        </nav>
        <div className="mobile-menu-contact">
          <p>見学やご相談はお気軽に</p>
          <a href="tel:0471570389"><Phone />04-7157-0389</a>
          <small>平日 10:00–19:00／土曜・祝日 9:00–18:00</small>
        </div>
      </div>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-sun" aria-hidden="true"><span /><span /><span /></div>
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="hero-eyebrow"><span>ABIKO, CHIBA</span>児童発達支援・放課後等デイサービス</p>
              <h1>遊びから、<br /><em>「できた！」</em>へ。</h1>
              <p className="hero-lead">サッカーを中心とした運動療育で、<br className="desktop-only" />一人ひとりの個性と未来を、明るくのびやかに。</p>
              <div className="hero-buttons">
                <a className="button button-primary" href="#contact">見学・相談を申し込む<ArrowRight /></a>
                <a className="button button-ghost" href="tel:0471570389"><Phone />04-7157-0389</a>
              </div>
              <div className="hero-meta">
                <span><Train />我孫子駅南口から徒歩5分</span>
                <span><Shield />送迎あり</span>
              </div>
            </div>

            <div className="hero-visual" aria-label="子どもたちがサッカーを楽しむ活動イメージ">
              <div className="hero-image-wrap">
                <Image src="/images/hero-himawari.png" alt="スタッフと子どもたちが屋外でサッカーを楽しむイメージ" fill priority sizes="(max-width: 900px) 100vw, 58vw" />
              </div>
              <div className="hero-badge hero-badge-main"><span className="mini-sun" aria-hidden="true" /><p><small>SINCE</small><strong>2022</strong></p></div>
              <div className="hero-badge hero-badge-note"><Sparkles /><p><strong>小さな一歩を</strong><span>大きな自信へ</span></p></div>
              <p className="image-note">※写真は活動イメージです</p>
            </div>
          </div>
          <a className="scroll-cue" href="#message"><span>SCROLL</span><i /></a>
        </section>

        <section className="message-section section" id="message">
          <div className="floating-word floating-word-one" aria-hidden="true">GROW</div>
          <div className="container message-grid">
            <div className="message-art" data-reveal>
              <div className="sunflower-illustration"><span className="sunflower-center" /><span className="sunflower-leaf leaf-one" /><span className="sunflower-leaf leaf-two" /><i /></div>
              <p>一人ひとりの<br />個性という種を<br />たいせつに。</p>
            </div>
            <div className="message-copy" data-reveal>
              <p className="section-kicker">OUR MESSAGE</p>
              <h2>ひまわりのように、<br />自分らしく咲いてほしい。</h2>
              <p>太陽に向かってまっすぐに咲くひまわりのように、子どもたちが自分らしく、のびのびと過ごせる場所でありたい。私たちは、一人ひとりの「好き」や「得意」を見つけ、楽しい活動の中から自信と未来への希望を育みます。</p>
              <p>うまくできた日も、思うようにいかなかった日も、そのすべてが成長の一歩。安全で安心できる環境の中で、子どもたちとご家族に寄り添い続けます。</p>
              <div className="message-sign"><span>運営</span><strong>株式会社ひまわり園</strong></div>
            </div>
          </div>
        </section>

        <section className="support-section section" id="support">
          <div className="container">
            <SectionHeading kicker="OUR SUPPORT" title="サッカーで育む、3つの力。" lead="勝ち負けや上手・下手だけではない、遊びの中にある大切な学びを、一人ひとりの成長につなげます。" />
            <div className="pillar-grid">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <article className={"pillar-card tone-" + pillar.tone} key={pillar.number} data-reveal>
                    <div className="pillar-top"><span>{pillar.number}</span><Icon /></div>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.text}</p>
                    <i className="pillar-line" />
                  </article>
                );
              })}
            </div>
            <div className="five-domains" data-reveal>
              <div><p className="section-kicker">FIVE DOMAINS</p><h3>5領域をつなぐ支援</h3><p>個別支援計画に基づき、活動を総合的な発達支援へつなげます。</p></div>
              <ul>
                <li>健康・生活</li><li>運動・感覚</li><li>認知・行動</li><li>言語・コミュニケーション</li><li>人間関係・社会性</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="program-section section" id="program">
          <div className="program-blob" aria-hidden="true" />
          <div className="container">
            <SectionHeading kicker="PROGRAM" title="夢中になれる体験が、未来をひらく。" lead="サッカーだけでなく、製作・おでかけ・クッキングなど、季節と好奇心に寄り添う多彩な活動を行います。" />
            <div className="feature-row" data-reveal>
              <div className="feature-image">
                <Image src="/images/soccer-support.png" alt="スタッフが見守る中でサッカーに取り組む子どものイメージ" fill sizes="(max-width: 800px) 100vw, 52vw" />
                <span className="image-label">SOCCER</span>
                <small>※写真は活動イメージです</small>
              </div>
              <div className="feature-copy">
                <span className="feature-number">01</span>
                <SoccerBall />
                <h3>サッカー・運動療育</h3>
                <p>走る、止まる、蹴る、見る、仲間と合わせる。楽しみながら身体の使い方を知り、ルールや順番、気持ちの切り替えも身につけていきます。</p>
                <ul><li><Check />一人ひとりのペースで参加</li><li><Check />成功体験を丁寧に積み重ねる</li><li><Check />感覚統合・基礎体力づくり</li></ul>
              </div>
            </div>
            <div className="feature-row reverse" data-reveal>
              <div className="feature-image">
                <Image src="/images/creative-support.png" alt="明るい室内で製作活動を楽しむ子どもたちのイメージ" fill sizes="(max-width: 800px) 100vw, 52vw" />
                <span className="image-label">CREATIVE</span>
                <small>※写真は活動イメージです</small>
              </div>
              <div className="feature-copy">
                <span className="feature-number">02</span>
                <Palette />
                <h3>製作・季節の体験</h3>
                <p>素材を選び、手を動かし、工夫する製作。地域へのおでかけやクッキング。様々な経験から「好き」「得意」と出会うきっかけをつくります。</p>
                <div className="program-tags"><span>製作</span><span>おでかけ</span><span>クッキング</span><span>季節行事</span></div>
              </div>
            </div>
            <div className="season-strip" data-reveal>
              <div><Calendar /><span><small>SPRING</small>進級イベント・お花見</span></div>
              <div><Sparkles /><span><small>SUMMER</small>夏祭り・プール</span></div>
              <div><Users /><span><small>AUTUMN</small>BBQ・サッカー</span></div>
              <div><Heart /><span><small>WINTER</small>クリスマス・初詣</span></div>
            </div>
          </div>
        </section>

        <section className="day-section section">
          <div className="container day-grid">
            <div className="day-intro" data-reveal>
              <p className="section-kicker">A DAY AT HIMAWARI</p>
              <h2>安心できるリズムの中で、<br />今日の「できた！」を。</h2>
              <p>その日の体調や気持ち、個別支援計画に合わせて活動を組み立てます。流れはご利用時間や曜日によって異なります。</p>
              <span className="example-label">放課後利用日の一例</span>
            </div>
            <ol className="day-timeline">
              {daySteps.map((step, index) => {
                const Icon = step.icon;
                return <li key={step.label} data-reveal><div className="timeline-icon"><Icon /></div><div><span>STEP {index + 1}</span><h3>{step.label}</h3><p>{step.note}</p></div></li>;
              })}
            </ol>
          </div>
        </section>

        <section className="guide-section section" id="guide">
          <div className="container">
            <SectionHeading kicker="HOW TO USE" title="ご利用までの流れ" lead="「何から始めればいい？」という段階から大丈夫です。お子さまとご家族に合う進め方を一緒に考えます。" />
            <ol className="use-flow">
              {useSteps.map(([number, title, text]) => (
                <li key={number} data-reveal><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight /></li>
              ))}
            </ol>
            <div className="guide-cta" data-reveal>
              <div><span className="mini-sun" aria-hidden="true" /><p><strong>まずは、施設の雰囲気を見に来ませんか？</strong><small>ご相談だけでもお気軽にどうぞ。</small></p></div>
              <a className="button button-dark" href="#contact">見学・相談を申し込む<ArrowRight /></a>
            </div>
          </div>
        </section>

        <section className="documents-section section" id="documents">
          <div className="container">
            <SectionHeading kicker="DISCLOSURE" title="情報公開" lead="支援の質を高めるための取り組みと、保護者の皆さまからいただいた評価を公開しています。" />
            <div className="document-grid">
              <article className="document-feature" data-reveal>
                <div className="document-icon"><Clipboard /></div>
                <p className="document-label">SUPPORT PROGRAM</p>
                <h3>支援プログラム</h3>
                <p>5領域とのつながり、家族支援・移行支援・地域連携、年間行事などをご覧いただけます。</p>
                <a href="http://www.himawari-fc.net/img/file-1747795715277-602701374.pdf" target="_blank" rel="noopener noreferrer">PDFを開く<Document /><ExternalLink /></a>
              </article>
              <article className="evaluation-card" data-reveal>
                <div className="evaluation-head"><div><p className="document-label">SELF EVALUATION</p><h3>自己評価・アンケート結果</h3></div><Document /></div>
                <div className="evaluation-list">
                  <a href="http://www.himawari-fc.net/img/file-1773908750576-376323269.pdf" target="_blank" rel="noopener noreferrer"><span><b>2025年度</b>保護者向け評価</span><ExternalLink /></a>
                  <a href="http://www.himawari-fc.net/img/file-1773908828836-697581550.pdf" target="_blank" rel="noopener noreferrer"><span><b>2025年度</b>事業者向け自己評価</span><ExternalLink /></a>
                  <a href="http://www.himawari-fc.net/img/file-1773804653637-60620760.pdf" target="_blank" rel="noopener noreferrer"><span><b>2024年度</b>保護者向け評価</span><ExternalLink /></a>
                  <a href="http://www.himawari-fc.net/img/file-1773804857099-987800904.pdf" target="_blank" rel="noopener noreferrer"><span><b>2024年度</b>事業者向け自己評価</span><ExternalLink /></a>
                </div>
                <p className="external-note">資料は既存サイトで公開されているPDFを新しいタブで開きます。</p>
              </article>
            </div>
          </div>
        </section>

        <section className="faq-section section" id="faq">
          <div className="container faq-grid">
            <div className="faq-intro" data-reveal><p className="section-kicker">FAQ</p><h2>よくあるご質問</h2><p>ほかにも気になることがありましたら、どんな小さなことでもお問い合わせください。</p><a href="#contact">お問い合わせへ<ArrowRight /></a></div>
            <div className="faq-list">
              {faqs.map(([question, answer], index) => (
                <details key={question} data-reveal>
                  <summary><span>Q{String(index + 1).padStart(2, "0")}</span><strong>{question}</strong><i><ChevronDown /></i></summary>
                  <div className="faq-answer"><span>A</span><p>{answer}</p></div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="access-section section" id="access">
          <div className="container">
            <SectionHeading kicker="ACCESS" title="ひまわりFCへのアクセス" />
            <div className="access-grid">
              <div className="map-wrap" data-reveal>
                <iframe title="ひまわりFC 周辺地図" src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3233.0651604473433!2d140.011803!3d35.87192!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60189de5f1114d77%3A0x1909e9d9098314f8!2z44Gy44G-44KP44KKRkM!5e0!3m2!1sja!2shk!4v1750150544075!5m2!1sja!2shk" width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <div className="access-info" data-reveal>
                <Brand />
                <p className="access-service">児童発達支援・放課後等デイサービス</p>
                <dl>
                  <div><dt><MapPin />所在地</dt><dd>〒270-1151<br />千葉県我孫子市本町3-5-25<br />渋谷ビル2F</dd></div>
                  <div><dt><Train />最寄駅</dt><dd>JR「我孫子駅」南口から徒歩5分</dd></div>
                  <div><dt><Phone />電話</dt><dd><a href="tel:0471570389">04-7157-0389</a></dd></div>
                  <div><dt><Clock />営業時間</dt><dd>平日 10:00–19:00<br />土曜・祝日 9:00–18:00<br /><small>定休日：日曜日・年末年始</small></dd></div>
                </dl>
                <a className="map-link" href="https://maps.google.com/?q=35.87192,140.011803" target="_blank" rel="noopener noreferrer">Google マップで見る<ExternalLink /></a>
              </div>
            </div>
            <div className="company-strip" data-reveal>
              <div><span>運営法人</span><strong>株式会社ひまわり園</strong></div>
              <div><span>事業所番号</span><strong>1252500267</strong></div>
              <div><span>事業開始</span><strong>2022年11月1日</strong></div>
              <div><span>サービス</span><strong>児童発達支援／放課後等デイサービス</strong></div>
            </div>
          </div>
        </section>

        <section className="contact-section section" id="contact">
          <div className="contact-sun" aria-hidden="true" />
          <div className="container contact-grid">
            <div className="contact-intro" data-reveal>
              <p className="section-kicker">CONTACT</p>
              <h2>見学・ご相談を<br />お待ちしています。</h2>
              <p>お子さまのこと、ご利用のこと、まずはお話ししてみませんか。内容を確認後、施設からご連絡します。</p>
              <div className="phone-card"><span><Phone /></span><div><small>お電話でのお問い合わせ</small><a href="tel:0471570389">04-7157-0389</a><p>平日 10:00–19:00／土曜・祝日 9:00–18:00</p></div></div>
              <div className="contact-promise"><Shield /><p><strong>安心してご相談ください</strong><span>送信内容は暗号化され、問い合わせ対応の目的に限って安全に管理します。</span></p></div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit} data-reveal noValidate>
              <div className="form-head"><span>01</span><p><strong>お問い合わせフォーム</strong><small>必須項目をご入力ください</small></p></div>
              <div className="form-row two-columns">
                <label><span>お名前 <b>必須</b></span><input name="name" type="text" autoComplete="name" maxLength={80} required placeholder="例）ひまわり 花子" /></label>
                <label><span>ふりがな</span><input name="nameKana" type="text" autoComplete="off" maxLength={100} placeholder="例）ひまわり はなこ" /></label>
              </div>
              <div className="form-row two-columns">
                <label><span>メールアドレス <b>必須</b></span><input name="email" type="email" autoComplete="email" maxLength={160} required placeholder="example@email.com" /></label>
                <label><span>電話番号</span><input name="phone" type="tel" autoComplete="tel" maxLength={30} inputMode="tel" placeholder="04-1234-5678" /></label>
              </div>
              <div className="form-row two-columns">
                <label><span>お問い合わせ種別 <b>必須</b></span><select name="inquiryType" required defaultValue=""><option value="" disabled>選択してください</option><option>見学・体験について</option><option>ご利用・空き状況について</option><option>支援内容について</option><option>採用について</option><option>その他</option></select></label>
                <label><span>お子さまの年代</span><select name="childAge" defaultValue=""><option value="">選択してください</option><option>未就学</option><option>小学校低学年</option><option>小学校高学年</option><option>中学生・高校生</option><option>該当なし・その他</option></select></label>
              </div>
              <fieldset className="form-row radio-field"><legend>ご希望の連絡方法 <b>必須</b></legend><div><label><input type="radio" name="preferredContact" value="メール" required /><span>メール</span></label><label><input type="radio" name="preferredContact" value="電話" /><span>電話</span></label><label><input type="radio" name="preferredContact" value="どちらでも可" /><span>どちらでも可</span></label></div></fieldset>
              <label className="form-row"><span>ご相談内容 <b>必須</b></span><textarea name="message" required minLength={10} maxLength={2000} rows={6} placeholder="見学希望日、ご利用について気になること、お子さまの様子などをご記入ください。" /></label>
              <div className="form-honeypot" aria-hidden="true"><label>ウェブサイト<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
              <label className="privacy-check"><input name="privacy" type="checkbox" required /><span><Link href="/privacy" target="_blank">プライバシーポリシー</Link>を確認し、個人情報の取り扱いに同意します。</span></label>

              {formState.type === "success" ? <div className="form-notice success" role="status"><Check /><p><strong>{formState.message}</strong>{formState.reference ? <span>受付番号：{formState.reference}</span> : null}</p></div> : null}
              {formState.type === "error" ? <div className="form-notice error" role="alert"><p>{formState.message}</p></div> : null}

              <button className="submit-button" type="submit" disabled={formState.type === "sending"}>{formState.type === "sending" ? "送信しています…" : "この内容で送信する"}<Send /></button>
              <p className="form-footnote">通常2〜3営業日以内を目安にご連絡します。お急ぎの場合はお電話ください。</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand"><Brand /><p>遊びから、「できた！」へ。</p><a href="https://www.instagram.com/himawari._.fc/" target="_blank" rel="noopener noreferrer"><Instagram />Instagram</a></div>
          <div className="footer-links"><div><strong>サイトメニュー</strong>{navItems.slice(0, 3).map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</div><div><strong>ご案内</strong><a href="#documents">情報公開</a><a href="#faq">よくあるご質問</a><a href="#access">アクセス</a><Link href="/privacy">プライバシーポリシー</Link></div></div>
          <div className="footer-contact"><strong>ひまわりFC</strong><p>〒270-1151<br />千葉県我孫子市本町3-5-25 渋谷ビル2F</p><a href="tel:0471570389"><Phone />04-7157-0389</a></div>
        </div>
        <div className="container footer-bottom"><p>© 2026 株式会社ひまわり園</p><span>児童発達支援・放課後等デイサービス</span></div>
      </footer>

      <div className="mobile-fixed-cta"><a href="tel:0471570389"><Phone /><span>電話する</span></a><a href="#contact"><Mail /><span>見学・相談</span></a></div>
      <button className={"back-to-top " + (showTop ? "is-visible" : "")} type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="ページ上部へ戻る"><ArrowUp /></button>
    </>
  );
}
