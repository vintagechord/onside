import Link from "next/link";

import { APP_CONFIG } from "@/lib/config";

export const metadata = {
  title: "신청서(구양식)",
};

export default function FormsPage() {
  const albumForms = [
    {
      label: "HWP",
      title: "음반 심의 신청서 (한글)",
      href: "/forms/Onside_music_application_hangul_form.hwp",
    },
    {
      label: "Word",
      title: "음반 심의 신청서 (Word)",
      href: "/forms/Onside_music_application_word_form.doc",
    },
  ];

  const mvForms = [
    {
      label: "HWP",
      title: "M/V 심의 신청서 (한글)",
      href: "/forms/Onside_MVapplication_hangul_form.hwp",
    },
    {
      label: "Word",
      title: "M/V 심의 신청서 (Word)",
      href: "/forms/Onside_MVapplication_word_form.doc",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        Forms
      </p>
      <h1 className="font-display mt-2 text-3xl text-foreground">
        신청서(구양식) 다운로드 및 이메일 접수
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        온라인 신청이 어렵거나 번거로운 경우, 신청서를 내려받아 작성 후 이메일로
        접수할 수 있습니다. 음반 심의와 M/V 심의를 구분해 다운로드하세요.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="group relative overflow-hidden rounded-[28px] border border-black/10 bg-[#8fe38f] p-6 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:bg-[#7ad97a] hover:shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-900/70">
            음반 심의
          </p>
          <h2 className="mt-3 text-xl font-semibold">
            음반 심의 신청서
          </h2>
          <p className="mt-2 text-sm text-slate-900/70">
            음반 심의용 신청서를 다운로드하여 작성하세요.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {albumForms.map((form) => (
              <Link
                key={form.href}
                href={form.href}
                className="inline-flex rounded-full border border-black/10 bg-white/85 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:-translate-y-0.5 hover:bg-white"
              >
                {form.label} 다운로드
              </Link>
            ))}
          </div>
        </section>

        <section className="group relative overflow-hidden rounded-[28px] border border-black/10 bg-[#e6e35b] p-6 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:bg-[#d8d654] hover:shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-900/70">
            M/V 심의
          </p>
          <h2 className="mt-3 text-xl font-semibold">
            M/V 심의 신청서
          </h2>
          <p className="mt-2 text-sm text-slate-900/70">
            M/V 심의용 신청서를 다운로드하여 작성하세요.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {mvForms.map((form) => (
              <Link
                key={form.href}
                href={form.href}
                className="inline-flex rounded-full border border-black/10 bg-white/85 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:-translate-y-0.5 hover:bg-white"
              >
                {form.label} 다운로드
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 rounded-[28px] border border-amber-200/70 bg-amber-50/80 p-6 text-sm text-slate-700 shadow-[0_18px_50px_rgba(245,158,11,0.15)]">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-300 text-base font-bold text-slate-900 shadow-[0_12px_24px_rgba(245,158,11,0.35)] live-blink">
            !
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              필독
            </p>
            <p className="text-sm font-semibold text-slate-900">
              작성 완료된 신청서와 음원/영상 파일을 이메일{" "}
              <span className="font-bold text-slate-900">
                {APP_CONFIG.supportEmail}
              </span>
              로 보내주시면 접수 안내를 드립니다.
            </p>
            <p className="text-xs text-slate-600">
              신청서와 음원/영상 파일을 모두 보내셔야 접수가 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
