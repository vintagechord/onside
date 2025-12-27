import { createServerSupabase } from "@/lib/supabase/server";

type AdBanner = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

function isBannerActive(banner: AdBanner, now: Date) {
  const startsOk = !banner.starts_at || new Date(banner.starts_at) <= now;
  const endsOk = !banner.ends_at || new Date(banner.ends_at) >= now;
  return startsOk && endsOk;
}

export async function StripAdBanner() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("ad_banners")
    .select("id, title, image_url, link_url, starts_at, ends_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) return null;

  const now = new Date();
  const banner = data.find((item) => isBannerActive(item, now));

  if (!banner) return null;

  const content = (
    <div className="flex h-24 items-center gap-4 overflow-hidden rounded-[28px] border border-border/60 bg-card/90 shadow-[0_18px_60px_rgba(15,23,42,0.2)]">
      <img
        src={banner.image_url}
        alt={banner.title}
        className="h-full w-40 object-cover sm:w-56"
      />
      <div className="flex flex-1 items-center justify-between gap-4 pr-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Ad
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {banner.title}
          </p>
        </div>
        <span className="rounded-full border border-border/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
          자세히 보기
        </span>
      </div>
    </div>
  );

  return banner.link_url ? (
    <a href={banner.link_url} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    content
  );
}
