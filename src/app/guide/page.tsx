import Link from "next/link";

export const metadata = {
  title: "심의 안내",
};

const albumSteps = [
  {
    number: "01",
    title: "음반심의란?",
    description:
      "TV/라디오에 음악이 송출되려면 각 방송국 심의를 통과해야 합니다. 가사 내 욕설·비속어·상품 노출 등의 요소를 확인하는 절차를 통칭해 음반심의라고 합니다.",
  },
  {
    number: "02",
    title: "방송국 심의 현황",
    description:
      "심의를 받은 음반은 MBC, SBS, KBS, TBC, TBN 등의 채널을 통해 전국 79개 지역 방송국에 전달됩니다.",
    bullets: [
      "심의기간: 접수 후 하루 ~ 최대 3주 (방송국별 상이)",
      "발매 전/후 모두 접수 가능",
      "현재 다수 방송국은 직접 방문 접수가 기준",
    ],
  },
  {
    number: "03",
    title: "Onside의 심의 대행",
    description: "심의 플랫폼에서 쉽고 빠른 접수",
    bullets: [
      "온라인/카드 결제 지원",
      "온라인 제출로 간편 접수",
      "디지털 음반의 경우 심의용 CD·가사집 무료 제작",
      "진행 상황과 결과를 한눈에 보는 개별 페이지",
    ],
  },
];

const mvNotes = [
  {
    id: "mv-prereq",
    content: "뮤직비디오 심의는 음원 심의 완료 후 진행 가능합니다.",
  },
  {
    id: "mv-purpose",
    content: (
      <span>
        심의 목적은{" "}
        <span className="font-semibold text-foreground">
          ① TV 방송 송출과 ② 유통사 제출/온라인 업로드(YouTube 등)
        </span>
        로 나뉩니다.
      </span>
    ),
  },
  {
    id: "mv-flow",
    content:
      "TV 송출 목적은 방송국별 개별 심의가 필요합니다. 온라인 송출 목적은 한 방송사 심의만으로 유통·온라인 송출이 가능합니다.",
  },
  {
    id: "mv-format",
    content: "권장 영상 파일 포맷 MOV · 1920×1080 · 29.97fps",
  },
  {
    id: "mv-rating",
    content:
      "심의 완료 후 등급분류 파일을 결과 페이지에서 다운받을 수 있습니다.",
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        Review Guide
      </p>
      <h1 className="font-display mt-2 text-3xl text-foreground">심의 안내</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        음반과 뮤직비디오 심의 진행 방식과 준비사항을 한눈에 정리했습니다.
      </p>

      <section className="mt-10 rounded-[32px] border border-border/60 bg-card/80 p-8 shadow-[0_22px_70px_rgba(15,23,42,0.1)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#7ad97a] bg-[#8fe38f] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">
            음반심의
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Album Review Guide
          </span>
        </div>
        <h2 className="font-display mt-4 text-2xl text-foreground">
          음반심의, 이렇게 진행됩니다
        </h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {albumSteps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-border/60 bg-background/70 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-xs font-semibold uppercase tracking-[0.2em] text-background">
                  {step.number}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {step.title}
                  </p>
                  {step.description === "음원과 신청서만 보내주세요" && (
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {step.description !== "음원과 신청서만 보내주세요" && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
              {step.bullets && (
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {step.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/70" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard/new/album"
            className="inline-flex items-center rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:-translate-y-0.5 hover:bg-amber-200 hover:text-slate-900"
          >
            음반심의 신청하러 가기
          </Link>
        </div>
      </section>

      <section className="mt-12 rounded-[32px] border border-border/60 bg-card/80 p-8 shadow-[0_22px_70px_rgba(15,23,42,0.1)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#d8d654] bg-[#e6e35b] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">
            M/V심의
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            M/V Review Guide
          </span>
        </div>
        <h2 className="font-display mt-4 text-2xl text-foreground">
          접수 전 참고사항
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          뮤직비디오 심의, 이것만 확인하세요
        </p>

        <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {mvNotes.map((note) => (
              <li key={note.id} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground/70" />
                <span>{note.content}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard/new/mv"
            className="inline-flex items-center rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:-translate-y-0.5 hover:bg-amber-200 hover:text-slate-900"
          >
            M/V 심의 신청하러 가기
          </Link>
        </div>
      </section>
    </div>
  );
}
