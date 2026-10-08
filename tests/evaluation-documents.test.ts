import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const documents = [
  { year: 2025, type: "parent", label: "保護者向け評価", sha256: "3922b4a2f01dc6fafaa01b0bd7f22b10f6baae11c9c3ff70ceb4e64b266cd2b4" },
  { year: 2025, type: "provider", label: "事業者向け自己評価", sha256: "0401bab3ba05a134e35d1eec748ba26f7fd98fe2b70c2afa6d30570b0b263466" },
  { year: 2024, type: "parent", label: "保護者向け評価", sha256: "8aa0f3baef9df21c58cea18313b4bfbcc76fc09bfb95478309d8ce02461acc37" },
  { year: 2024, type: "provider", label: "事業者向け自己評価", sha256: "a8c02af09acfdd00554ff82aad4a7c24ad35421fdfc5150846f3766c7107a859" },
];

const page = readFileSync(resolve("src/app/page.tsx"), "utf8");

describe("公開評価資料", () => {
  it.each(documents)("$year 年度 $label が対応する原本PDFをサイト内で公開する", ({ year, type, label, sha256 }) => {
    const href = `/documents/evaluation-${year}-${type}.pdf`;
    const pdf = readFileSync(resolve(`public${href}`));

    expect(pdf.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(createHash("sha256").update(pdf).digest("hex")).toBe(sha256);
    expect(page).toContain(`href="${href}" target="_blank" rel="noopener noreferrer"><span><b>${year}年度</b>${label}</span>`);
  });

  it("全4件を掲載し、旧サイトへの依存と古い案内文を残さない", () => {
    expect(page.match(/href="\/documents\/evaluation-\d{4}-(?:parent|provider)\.pdf"/g)).toHaveLength(4);
    expect(page).not.toContain("himawari-fc.net");
    expect(page).not.toContain("既存サイトで公開されているPDF");
    expect(page).toContain("当サイトで公開している評価資料（PDF）を新しいタブで開きます。");
  });
});
