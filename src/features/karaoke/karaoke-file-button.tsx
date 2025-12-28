"use client";

import * as React from "react";

import {
  getKaraokeRecommendationFileUrlAction,
  getKaraokeRequestFileUrlAction,
} from "@/features/karaoke/actions";

export function KaraokeFileButton({
  kind,
  targetId,
  label = "파일 확인",
}: {
  kind: "request" | "recommendation";
  targetId: string;
  label?: string;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const result =
      kind === "request"
        ? await getKaraokeRequestFileUrlAction({ requestId: targetId })
        : await getKaraokeRecommendationFileUrlAction({
            recommendationId: targetId,
          });
    setIsLoading(false);
    if (result.error) {
      setErrorMessage(result.error);
      return;
    }
    if (result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "확인 중" : label}
      </button>
      {errorMessage && (
        <span className="text-[11px] text-red-500">{errorMessage}</span>
      )}
    </div>
  );
}
