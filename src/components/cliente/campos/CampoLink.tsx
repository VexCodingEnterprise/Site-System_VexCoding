'use client';

export function CampoLink({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const links = [...value];
  while (links.length < 3) {
    links.push('');
  }

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div key={`link-${index}`} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
          <input
            className="field h-12 text-base"
            type="url"
            inputMode="url"
            value={link}
            placeholder="https://"
            onChange={(event) => {
              const next = [...links];
              next[index] = event.target.value;
              onChange(next.filter((entry) => entry.trim().length > 0));
            }}
          />
          <button
            type="button"
            disabled={!link}
            onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
            className="h-12 border border-[var(--line)] bg-[var(--panel-alt)] text-sm font-medium disabled:opacity-50"
          >
            Testar link
          </button>
        </div>
      ))}
    </div>
  );
}
