"use client";

import * as React from "react";

import { KaraokeCreditPanel } from "@/features/karaoke/karaoke-credit-panel";
import { KaraokeForm } from "@/features/karaoke/karaoke-form";
import { KaraokeStatusPanel } from "@/features/karaoke/karaoke-status-panel";

type PromotionSummary = {
  id: string;
  credits_balance: number;
  credits_required: number;
  tj_enabled: boolean;
  ky_enabled: boolean;
  reference_url: string | null;
  submission?: {
    title?: string | null;
    artist_name?: string | null;
    melon_url?: string | null;
  } | null;
};

type KaraokeRequest = {
  id: string;
  title: string;
  artist: string | null;
  file_path?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
};

type TabKey = "apply" | "credit" | "status";

export function KaraokeTabs({
  userId,
  promotions,
  creditBalance,
  requests,
}: {
  userId?: string | null;
  promotions: PromotionSummary[];
  creditBalance: number;
  requests: KaraokeRequest[];
}) {
  const [tab, setTab] = React.useState<TabKey>("apply");

  return (
    <div className="space-y-8">
      <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-muted/60 p-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <button
          type="button"
          onClick={() => setTab("apply")}
          className={`rounded-full px-4 py-2 transition ${
            tab === "apply"
              ? "bg-background text-foreground shadow-sm"
              : "hover:text-foreground"
          }`}
        >
          노래방 등록 신청하기
        </button>
        <button
          type="button"
          onClick={() => setTab("credit")}
          className={`rounded-full px-4 py-2 transition ${
            tab === "credit"
              ? "bg-background text-foreground shadow-sm"
              : "hover:text-foreground"
          }`}
        >
          크레딧 적립하기
        </button>
        <button
          type="button"
          onClick={() => setTab("status")}
          className={`rounded-full px-4 py-2 transition ${
            tab === "status"
              ? "bg-background text-foreground shadow-sm"
              : "hover:text-foreground"
          }`}
        >
          진행상황
        </button>
      </div>

      {tab === "apply" && <KaraokeForm userId={userId ?? null} />}
      {tab === "credit" && (
        <KaraokeCreditPanel
          userId={userId ?? null}
          promotions={promotions}
          creditBalance={creditBalance}
        />
      )}
      {tab === "status" && (
        <KaraokeStatusPanel
          userId={userId ?? null}
          initialRequests={requests}
        />
      )}
    </div>
  );
}
