export const inquiryTypes = [
  "見学・体験について",
  "ご利用・空き状況について",
  "支援内容について",
  "採用について",
  "その他",
] as const;

export const contactMethods = ["メール", "電話", "どちらでも可"] as const;

export type ContactPayload = {
  name: string;
  nameKana?: string;
  email: string;
  phone?: string;
  inquiryType: string;
  childAge?: string;
  schoolName?: string;
  preferredContact: string;
  message: string;
  privacy: boolean;
  website?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+()\-\s]{9,20}$/;

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function validateContactPayload(input: unknown) {
  if (!input || typeof input !== "object") {
    return { ok: false as const, error: "入力内容を確認してください。" };
  }

  const value = input as Record<string, unknown>;
  const data: ContactPayload = {
    name: clean(value.name, 80),
    nameKana: clean(value.nameKana, 100),
    email: clean(value.email, 160).toLowerCase(),
    phone: clean(value.phone, 30),
    inquiryType: clean(value.inquiryType, 60),
    childAge: clean(value.childAge, 40),
    schoolName: clean(value.schoolName, 120),
    preferredContact: clean(value.preferredContact, 30),
    message: clean(value.message, 2_000),
    privacy: value.privacy === true,
    website: clean(value.website, 200),
  };

  if (data.website) {
    return { ok: true as const, data, isBot: true };
  }
  if (data.name.length < 2) {
    return { ok: false as const, error: "お名前を入力してください。" };
  }
  if (!emailPattern.test(data.email)) {
    return { ok: false as const, error: "メールアドレスを正しく入力してください。" };
  }
  if (data.phone && !phonePattern.test(data.phone)) {
    return { ok: false as const, error: "電話番号を正しく入力してください。" };
  }
  if (!inquiryTypes.includes(data.inquiryType as (typeof inquiryTypes)[number])) {
    return { ok: false as const, error: "お問い合わせ種別を選択してください。" };
  }
  if (!contactMethods.includes(data.preferredContact as (typeof contactMethods)[number])) {
    return { ok: false as const, error: "ご希望の連絡方法を選択してください。" };
  }
  if (data.preferredContact === "電話" && !data.phone) {
    return { ok: false as const, error: "電話での連絡をご希望の場合は、電話番号を入力してください。" };
  }
  if (data.message.length < 10) {
    return { ok: false as const, error: "ご相談内容を10文字以上で入力してください。" };
  }
  if (!data.privacy) {
    return { ok: false as const, error: "プライバシーポリシーへの同意が必要です。" };
  }

  const links = data.message.match(/https?:\/\//gi)?.length ?? 0;
  if (links > 2) {
    return { ok: false as const, error: "URLを含む内容は送信できません。" };
  }

  return { ok: true as const, data, isBot: false };
}
