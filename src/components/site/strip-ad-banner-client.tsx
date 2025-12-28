"use client";

import * as React from "react";

type AdBanner = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
};

const ROTATE_MS = 4500;
const TRANSITION_MS = 700;

export function StripAdBannerClient({ banners }: { banners: AdBanner[] }) {
  const safeBanners = Array.isArray(banners) ? banners.filter(Boolean) : [];
  if (safeBanners.length === 0) return null;

  // 1개면 롤링 없이 1개만 표시
  if (safeBanners.length === 1) {
    const banner = safeBanners[0];
    return (
      <div className="strip-shimmer overflow-hidden rounded-[28px] border border-white/40 bg-white/55 shadow-[0_18px_60px_rgba(15,23,42,0.2)] backdrop-blur-md dark:border-white/10 dark:bg-black/35">
        <BannerLinkWrap banner={banner}>
          <BannerContent banner={banner} />
        </BannerLinkWrap>
      </div>
    );
  }

  // 무한루프용: 첫 배너 1개 복제
  const items = React.useMemo(
    () => [...safeBanners, safeBanners[0]],
    [safeBanners],
  );

  const [index, setIndex] = React.useState(0);
  const [enableTransition, setEnableTransition] = React.useState(true);

  // “한 줄만 보이도록” row 높이 고정(픽셀 기반)
  const firstRowRef = React.useRef<HTMLDivElement | null>(null);
  const [rowHeight, setRowHeight] = React.useState<number>(0);

  React.useEffect(() => {
    const el = firstRowRef.current;
    if (!el) return;

    const measure = () => {
      const h = el.getBoundingClientRect().height;
      if (h && Math.abs(h - rowHeight) > 0.5) setRowHeight(h);
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 자동 롤링
  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setEnableTransition(true);
      setIndex((prev) => prev + 1);
    }, ROTATE_MS);

    return () => window.clearInterval(interval);
  }, []);

  // 마지막(복제된 첫 배너)까지 갔다면 전환 후 0으로 점프
  React.useEffect(() => {
    const lastIndex = items.length - 1;
    if (index !== lastIndex) return;

    const t = window.setTimeout(() => {
      setEnableTransition(false);
      setIndex(0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setEnableTransition(true));
      });
    }, TRANSITION_MS);

    return () => window.clearTimeout(t);
  }, [index, items.length]);

  // 높이 측정 전: 첫 줄만 렌더해서 다중 노출 방지
  if (rowHeight <= 0) {
    const banner = safeBanners[0];
    return (
      <div className="strip-shimmer overflow-hidden rounded-[28px] border border-white/40 bg-white/55 shadow-[0_18px_60px_rgba(15,23,42,0.2)] backdrop-blur-md dark:border-white/10 dark:bg-black/35">
        <div ref={firstRowRef}>
          <BannerContent banner={banner} />
        </div>
      </div>
    );
  }

  return (
    <div className="strip-shimmer overflow-hidden rounded-[28px] border border-white/40 bg-white/55 shadow-[0_18px_60px_rgba(15,23,42,0.2)] backdrop-blur-md dark:border-white/10 dark:bg-black/35">
      {/* ✅ 한 줄(rowHeight)만 보이도록 클립 */}
      <div className="relative overflow-hidden" style={{ height: rowHeight }}>
        <div
          className="flex flex-col will-change-transform"
          style={{
            transform: `translateY(-${index * rowHeight}px)`,
            transition: enableTransition
              ? `transform ${TRANSITION_MS}ms ease`
              : "none",
          }}
        >
          {items.map((banner, itemIndex) => {
            const row = (
              <BannerLinkWrap banner={banner}>
                <BannerContent banner={banner} />
              </BannerLinkWrap>
            );

            if (itemIndex === 0) {
              return (
                <div key={`wrap-${banner.id}-${itemIndex}`} ref={firstRowRef}>
                  {row}
                </div>
              );
            }

            return (
              <div key={`${banner.id}-${itemIndex}`} className="block">
                {row}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * ✅ link_url 정규화 (오타 프로토콜 교정 포함)
 * - "/path" 내부링크: 그대로
 * - "https://..." / "http://..." 그대로
 * - "mailto:, tel:, sms:" 그대로
 * - "www..." 같은 프로토콜 없는 값: https:// 1번만 자동 부착
 * - "htttps//" / "https//" / "https:/" 같은 흔한 오타: https:// 로 교정
 * - 공백/빈값: 링크 처리 안 함
 */
function normalizeHref(input?: string | null): string | null {
  if (!input) return null;
  let raw = input.trim();
  if (!raw) return null;

  // 내부 링크
  if (raw.startsWith("/")) return raw;

  // 허용 스킴 (그대로)
  if (/^(mailto:|tel:|sms:)/i.test(raw)) return raw;

  // ✅ 이미 정상 http(s)://면 그대로
  if (/^https?:\/\//i.test(raw)) return raw;

  // ✅ "프로토콜을 쓰려다 만" 흔한 오타 교정
  // 1) https//example.com  (콜론 누락)
  if (/^https?\/\/+/i.test(raw)) {
    raw = raw.replace(/^https?\/\/+/i, (m) =>
      m.toLowerCase().startsWith("https") ? "https://" : "http://",
    );
    return raw;
  }

  // 2) https:/example.com (슬래시 1개)
  if (/^https?:\/[^/]/i.test(raw)) {
    raw = raw.replace(/^https?:\//i, (m) =>
      m.toLowerCase().startsWith("https") ? "https://" : "http://",
    );
    return raw;
  }

  // 3) htttps//example.com 또는 htttps://example.com (t가 여러개)
  if (/^ht+tps?:\/\//i.test(raw)) {
    raw = raw.replace(/^ht+tps?:\/\//i, "https://");
    return raw;
  }
  if (/^ht+tps?\/\/+/i.test(raw)) {
    raw = raw.replace(/^ht+tps?\/\/+/i, "https://");
    return raw;
  }

  // ✅ 다른 스킴(ex: ftp://, custom://) 흔적이 있으면 건드리지 않음
  if (raw.includes("://")) return raw;

  // ✅ 여기까지 오면 도메인/호스트로 보고 https://를 한 번만 붙임
  return `https://${raw}`;
}

function isExternalHref(href: string) {
  return (
    /^(https?:\/\/)/i.test(href) || /^(mailto:|tel:|sms:)/i.test(href)
  );
}

function BannerLinkWrap({
  banner,
  children,
}: {
  banner: AdBanner;
  children: React.ReactNode;
}) {
  const href = normalizeHref(banner.link_url);
  if (!href) return <div>{children}</div>;

  const external = isExternalHref(href);

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </a>
  );
}

function BannerContent({ banner }: { banner: AdBanner }) {
  return (
    <div className="px-2 py-2 sm:px-3 sm:py-3">
      <div className="flex h-20 overflow-hidden rounded-2xl border border-white/30 bg-white/35 shadow-[0_10px_30px_rgba(15,23,42,0.14)] backdrop-blur-md dark:border-white/10 dark:bg-black/25 sm:h-24">
        {/* 이미지: 영역의 ~80% */}
        <div className="relative h-full flex-[0_0_68%] sm:flex-[0_0_74%] md:flex-[0_0_80%]">
          <img
            src={banner.image_url}
            alt={banner.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent dark:from-black/35 dark:via-black/20" />
        </div>

        {/* 우측 정보/버튼 */}
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 sm:px-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:text-xs">
              Our Other Brand
            </p>
            {/* 
<p className="mt-1 truncate text-xs font-semibold text-foreground sm:text-sm">
  {banner.title}
</p>
*/}
          </div>

          <span className="shrink-0 rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-foreground hover:bg-background/60 sm:px-4 sm:py-2 sm:text-xs">
            자세히 보기
          </span>
        </div>
      </div>
    </div>
  );
}
