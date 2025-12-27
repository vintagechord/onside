"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function TrackLookupForm() {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = token.trim();
    if (!value) {
      setError("조회 코드를 입력해주세요.");
      return;
    }
    setError("");
    router.push(`/track/${encodeURIComponent(value)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <input
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="비회원 조회 코드 입력"
        className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-foreground"
      />
      {error ? (
        <p className="text-xs text-rose-500">{error}</p>
      ) : null}
      <button
        type="submit"
        className="w-full rounded-full bg-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:bg-amber-200 hover:text-slate-900"
      >
        진행상황 조회
      </button>
    </form>
  );
}
