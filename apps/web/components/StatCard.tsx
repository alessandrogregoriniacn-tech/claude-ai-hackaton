interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "primary";
}

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  const valueColor =
    tone === "positive"
      ? "text-positive"
      : tone === "primary"
        ? "text-primary"
        : "text-foreground";

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${valueColor}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
