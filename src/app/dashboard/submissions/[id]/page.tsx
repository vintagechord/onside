import { notFound } from "next/navigation";

import { SubmissionDetailClient } from "@/features/submissions/submission-detail-client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureAlbumStationReviews } from "@/lib/station-reviews";

export const metadata = {
  title: "심의 상세",
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const baseSelect =
    "id, user_id, title, artist_name, type, status, payment_status, amount_krw, created_at, updated_at, package:packages ( name, station_count, price_krw )";
  const fullSelect =
    "id, user_id, title, artist_name, type, status, payment_status, payment_method, amount_krw, mv_rating_file_path, created_at, updated_at, package:packages ( name, station_count, price_krw )";

  const fetchSubmission = async (
    client: typeof supabase,
    column: "id" | "guest_token",
    value: string,
  ) => {
    const { data, error } = await client
      .from("submissions")
      .select(fullSelect)
      .eq(column, value)
      .maybeSingle();

    if (!error) {
      return data;
    }

    if (error.code === "PGRST204") {
      const { data: fallbackData } = await client
        .from("submissions")
        .select(baseSelect)
        .eq(column, value)
        .maybeSingle();
      return fallbackData ?? null;
    }

    return null;
  };

  let resolvedSubmission = await fetchSubmission(supabase, "id", params.id);
  const admin = createAdminClient();

  if (!resolvedSubmission && user) {
    const adminSubmission = await fetchSubmission(admin, "id", params.id);
    if (adminSubmission && adminSubmission.user_id === user.id) {
      resolvedSubmission = adminSubmission;
    }
  }

  if (!resolvedSubmission && !user) {
    resolvedSubmission = await fetchSubmission(admin, "guest_token", params.id);
  }

  if (!resolvedSubmission) {
    notFound();
  }
  const packageInfo = Array.isArray(resolvedSubmission.package)
    ? resolvedSubmission.package[0]
    : resolvedSubmission.package;

  if (resolvedSubmission.type === "ALBUM") {
    await ensureAlbumStationReviews(
      supabase,
      resolvedSubmission.id,
      packageInfo?.station_count ?? null,
      packageInfo?.name ?? null,
    );
  }

  const stationReviewsClient = user ? supabase : admin;

  const { data: events } = await supabase
    .from("submission_events")
    .select("id, event_type, message, created_at")
    .eq("submission_id", resolvedSubmission.id)
    .order("created_at", { ascending: false });

  const { data: stationReviews } = await stationReviewsClient
    .from("station_reviews")
    .select(
      "id, status, result_note, updated_at, station:stations ( id, name, code )",
    )
    .eq("submission_id", resolvedSubmission.id)
    .order("updated_at", { ascending: false });
  const normalizedStationReviews =
    stationReviews?.map((review) => ({
      ...review,
      station: Array.isArray(review.station) ? review.station[0] : review.station,
    })) ?? [];

  const filesClient = user ? supabase : admin;
  const { data: submissionFiles } = await filesClient
    .from("submission_files")
    .select("id, kind, file_path, original_name, mime, size, created_at")
    .eq("submission_id", resolvedSubmission.id)
    .order("created_at", { ascending: false });

  const isOwner = Boolean(user && resolvedSubmission.user_id === user.id);
  let creditBalance = 0;
  let promotion = null;

  if (isOwner && user) {
    const { data: creditRow } = await supabase
      .from("karaoke_credits")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    creditBalance = creditRow?.balance ?? 0;

    const { data: promotionRow } = await supabase
      .from("karaoke_promotions")
      .select(
        "id, status, credits_balance, credits_required, tj_enabled, ky_enabled, reference_url",
      )
      .eq("submission_id", resolvedSubmission.id)
      .maybeSingle();
    promotion = promotionRow ?? null;
  }

  return (
    <SubmissionDetailClient
      submissionId={params.id}
      initialSubmission={{ ...resolvedSubmission, package: packageInfo ?? null }}
      initialEvents={events ?? []}
      initialStationReviews={normalizedStationReviews}
      initialFiles={submissionFiles ?? []}
      creditBalance={creditBalance}
      promotion={promotion}
      canManagePromotion={isOwner}
    />
  );
}
