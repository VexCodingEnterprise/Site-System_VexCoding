'use client';

export function CampoCor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const colors = [...value];
  while (colors.length < 3) {
    colors.push('#000000');
  }

  return (
    <div className="space-y-3">
      {colors.map((color, index) => (
        <div key={`color-${index}`} className="grid grid-cols-[56px_1fr] gap-3">
          <input
            className="h-12 w-full border border-[var(--line)] bg-[var(--panel)]"
            type="color"
            value={color}
            onChange={(event) => {
              const next = [...colors];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <input
            className="field h-12 text-base uppercase"
            value={color}
            onChange={(event) => {
              const next = [...colors];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}
