interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "gold";
}

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  // L'oro (accent-strong) è usato solo su valori grandi/bold: qui i valori sono
  // testo grande, quindi il contrasto AA è rispettato.
  const valueColor = tone === "gold" ? "text-accent-strong" : "text-foreground";

  return (
    <div className="rounded-card border border-border bg-surface p-5 transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${valueColor}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
