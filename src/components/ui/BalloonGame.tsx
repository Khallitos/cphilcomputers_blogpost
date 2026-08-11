"use client";

import dynamic from "next/dynamic";

const BalloonArrowGame = dynamic(
  () => import("@/components/ui/BalloonArrowGame"),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="h-[460px] w-full animate-pulse rounded-2xl border border-border bg-surface sm:h-[600px]"
      />
    ),
  },
);

export default function BalloonGame() {
  return <BalloonArrowGame />;
}
