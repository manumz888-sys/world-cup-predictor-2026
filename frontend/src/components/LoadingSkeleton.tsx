interface Props {
  rows?: number;
  className?: string;
}

function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-5 animate-pulse rounded bg-gradient-to-r from-cyber-surface via-cyber-border to-cyber-surface bg-[length:200%_100%] ${className}`}
      style={{ animation: "shimmer 1.8s infinite" }}
    />
  );
}

export default function LoadingSkeleton({ rows = 3, className = "" }: Props) {
  return (
    <div
      data-testid="loading-skeleton"
      className={`space-y-3 ${className}`}
      aria-busy="true"
      aria-label="Loading…"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg border border-cyber-border bg-cyber-surface p-4">
          <SkeletonRow className="mb-3 w-2/3" />
          <SkeletonRow className="w-1/2" />
        </div>
      ))}
    </div>
  );
}
