import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { formatDateTime } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = {
  title: "나의 심의 내역",
};

const typeLabels: Record<string, string> = {
  ALBUM: "앨범",
  MV_DISTRIBUTION: "MV 유통",
  MV_BROADCAST: "MV 방송",
};

const statusLabels: Record<string, { label: string; tone: string }> = {
  DRAFT: { label: "임시저장", tone: "bg-slate-500/10 text-slate-600" },
  SUBMITTED: { label: "접수", tone: "bg-sky-500/10 text-sky-600" },
  PRE_REVIEW: {
    label: "사전검토",
    tone: "bg-violet-500/10 text-violet-600",
  },
  WAITING_PAYMENT: {
    label: "결제대기",
    tone: "bg-amber-500/10 text-amber-700",
  },
  IN_PROGRESS: { label: "진행중", tone: "bg-indigo-500/10 text-indigo-600" },
  RESULT_READY: { label: "결과", tone: "bg-emerald-500/10 text-emerald-600" },
  COMPLETED: { label: "완료", tone: "bg-emerald-500/15 text-emerald-700" },
};

const paymentLabels: Record<string, { label: string; tone: string }> = {
  UNPAID: { label: "미결제", tone: "bg-slate-500/10 text-slate-600" },
  PAYMENT_PENDING: {
    label: "결제확인중",
    tone: "bg-amber-500/10 text-amber-700",
  },
  PAID: { label: "결제완료", tone: "bg-emerald-500/10 text-emerald-600" },
  REFUNDED: { label: "환불", tone: "bg-rose-500/10 text-rose-600" },
};

export default async function HistoryPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select(
      "id, title, artist_name, status, payment_status, created_at, type",
    )
    .order("updated_at", { ascending: false })
    .eq("user_id", user.id);

  return (
    <DashboardShell
      title="나의 심의 내역"
      description="심의 기록을 발매 음원 단위로 확인합니다."
      activeTab="history"
      action={
        <Link
          href="/dashboard/new"
          className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background"
        >
          새 접수
        </Link>
      }
    >
      <div className="space-y-3">
        {submissions && submissions.length > 0 ? (
          submissions.map((submission, index) => {
            const statusInfo =
              statusLabels[submission.status] ?? statusLabels.DRAFT;
            const paymentInfo =
              paymentLabels[submission.payment_status] ??
              paymentLabels.UNPAID;
            const typeLabel = typeLabels[submission.type] ?? submission.type;
            return (
              <div
                key={submission.id}
                className="grid items-center gap-4 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 text-sm transition hover:border-foreground md:grid-cols-[28px_28px_1fr_auto]"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200/70 via-white/40 to-indigo-200/60 text-xs font-semibold text-foreground">
                    ONS
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {submission.title || "제목 미입력"}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${statusInfo.tone}`}
                      >
                        {statusInfo.label}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${paymentInfo.tone}`}
                      >
                        {paymentInfo.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {submission.artist_name || "아티스트 미입력"} · {typeLabel} ·{" "}
                      {formatDateTime(submission.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Link
                    href={`/dashboard/submissions/${submission.id}`}
                    className="rounded-full border border-border/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
                  >
                    상세
                  </Link>
                  <button
                    type="button"
                    className="rounded-full border border-border/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    재생
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-border/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    추가
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 px-4 py-6 text-xs text-muted-foreground">
            아직 접수된 내역이 없습니다.
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
