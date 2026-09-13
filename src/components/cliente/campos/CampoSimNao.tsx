'use client';

export function CampoSimNao({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'Sim', nextValue: true },
        { label: 'Não', nextValue: false },
      ].map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.nextValue)}
          className={`h-14 border text-base font-medium ${
            value === option.nextValue
              ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
              : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
