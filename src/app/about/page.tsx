import { APP_CONFIG } from "@/lib/config";

export const metadata = {
  title: "회사소개",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        회사소개
      </p>
      <h1 className="font-display mt-2 text-3xl text-foreground">온사이드</h1>
      <p className="mt-3 text-sm text-muted-foreground sm:text-base">
        온사이드는 2017년부터 현재까지 음반/뮤비 심의 대행을 전문적으로 수행하고
        있습니다. 수많은 뮤지션과 기획사의 심의를 함께하며, 빠르고 편한 신청
        경험을 만들고자 노력하고 있습니다.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-border/60 bg-card/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            주요 서비스
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {[
              "카드·모바일 등 온라인 결제 지원",
              "CD/가사집/DVD 무료 제작 지원",
              "실시간 심의 통보 페이지 제공",
              "전 방송사 접수 진행 (서울·경기권)",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6">
          <section className="rounded-[28px] border border-border/60 bg-card/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              정식 등록 업체
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              * 온사이드는 사업자 및 음반/음악영상물제작업 등록을 마친 정식
              업체입니다.
            </p>
          </section>

          <section className="rounded-[28px] border border-border/60 bg-card/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              문의
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                전화:{" "}
                <span className="font-semibold text-foreground">
                  {APP_CONFIG.supportPhone}
                </span>
              </p>
              <p>
                이메일:{" "}
                <span className="font-semibold text-foreground">
                  {APP_CONFIG.supportEmail}
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
