import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HistoryList } from "@/components/dashboard/history-list";
import { ensureAlbumStationReviews } from "@/lib/station-reviews";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = {
  title: "나의 심의 내역",
};

const typeLabels: Record<string, string> = {
  ALBUM: "앨범",
  MV_DISTRIBUTION: "MV 유통",
  MV_BROADCAST: "MV 방송",
};

export default async function HistoryPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullSelect =
    "id, title, artist_name, status, payment_status, payment_method, created_at, updated_at, type, amount_krw, is_oneclick, package:packages ( name, station_count ), album_tracks ( id, track_no, track_title ), station_reviews ( id, status, updated_at, station:stations ( name ) )";
  const fallbackSelect =
    "id, title, artist_name, status, created_at, updated_at, type, amount_krw, is_oneclick, station_reviews ( id, status, updated_at, station:stations ( name ) )";

  let { data: submissions, error: submissionError } = await supabase
    .from("submissions")
    .select(fullSelect)
    .order("updated_at", { ascending: false })
    .eq("user_id", user.id);

  if (
    submissionError?.code === "PGRST204" ||
    submissionError?.message?.toLowerCase().includes("column")
  ) {
    const fallback = await supabase
      .from("submissions")
      .select(fallbackSelect)
      .order("updated_at", { ascending: false })
      .eq("user_id", user.id);

    submissions =
      fallback.data?.map((row) => ({
        ...row,
        payment_status: null,
        payment_method: null,
        package: null,
        album_tracks: [],
      })) ?? null;
  }

  if (submissions && submissions.length > 0) {
    await Promise.all(
      submissions
        .filter((submission) => submission.type === "ALBUM")
        .map((submission) => {
          const pkg = Array.isArray(submission.package)
            ? submission.package[0]
            : submission.package;
          return ensureAlbumStationReviews(
            supabase,
            submission.id,
            pkg?.station_count ?? null,
            pkg?.name ?? null,
          );
        }),
    );
  }

  const items =
    submissions?.map((submission, index) => {
      const typeLabel = typeLabels[submission.type] ?? submission.type;
      return {
        id: submission.id,
        order: index + 1,
        title: submission.title || "제목 미입력",
        artistName: submission.artist_name || "아티스트 미입력",
        typeLabel,
        createdAt: submission.created_at,
        updatedAt: submission.updated_at,
        status: submission.status,
        paymentStatus: submission.payment_status,
        paymentMethod: submission.payment_method ?? null,
        amountKrw: submission.amount_krw,
        isOneclick: submission.is_oneclick,
        packageInfo: Array.isArray(submission.package)
          ? submission.package[0]
          : submission.package ?? null,
        tracks:
          submission.album_tracks?.map((track) => ({
            id: track.id,
            trackNo: track.track_no,
            title: track.track_title ?? "",
          })) ?? [],
        stationReviews: (submission.station_reviews ?? []).map((review) => ({
          ...review,
          station: Array.isArray(review.station)
            ? review.station[0]
            : review.station,
        })),
      };
    }) ?? [];

  return (
    <DashboardShell
      title="나의 심의 내역"
      description="심의 기록을 발매 음원 단위로 확인합니다."
      activeTab="history"
    >
      <HistoryList initialItems={items} />
    </DashboardShell>
  );
}
