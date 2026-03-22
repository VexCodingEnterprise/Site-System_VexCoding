'use client';

export function ChecklistProgresso({
  currentSection,
  totalSections,
  title,
  percentage,
}: {
  currentSection: number;
  totalSections: number;
  title: string;
  percentage: number;
}) {
  return (
    <div className="space-y-3 border-b border-[var(--line)] bg-[var(--panel)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] muted">
            Secao {currentSection} de {totalSections}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">{title}</h2>
        </div>
        <span className="text-sm font-medium text-[var(--text)]">{percentage}%</span>
      </div>
      <div className="h-2 bg-[var(--panel-alt)]">
        <div className="h-2 bg-[var(--text)]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
