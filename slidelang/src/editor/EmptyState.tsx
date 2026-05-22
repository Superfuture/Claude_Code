interface EmptyStateProps {
  onPrompt: (p: string) => void;
  hasKey: boolean;
  onSetKey: () => void;
}

const EXAMPLES = [
  {
    label: "Q3 board update for a Series A SaaS",
    prompt:
      "Q3 board update for a Series A SaaS company. 6 slides. Include ARR chart, LTV formula, roadmap, and the ask.",
  },
  {
    label: "Intro to Transformers",
    prompt:
      "Intro to Transformers for engineers new to ML. 5 slides covering attention, scaled dot-product math, and a small parameter-scaling chart.",
  },
  {
    label: "Postmortem: yesterday's outage",
    prompt:
      "Engineering postmortem for a 47-minute API outage caused by a database connection leak. Include timeline, root cause, blast radius, and action items.",
  },
];

export function EmptyState({ onPrompt, hasKey, onSetKey }: EmptyStateProps) {
  return (
    <div className="w-full max-w-[640px] mx-auto py-12">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-accent font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Slidelang
        </div>
        <h1 className="font-serif text-4xl leading-[1.1] tracking-tight mb-3 text-ink">
          A deck-as-code authoring platform.
        </h1>
        <p className="text-ink-2 text-base leading-relaxed max-w-[480px] mx-auto">
          Write or generate a typed YAML deck. Layout validation catches overflow and contrast issues. One click repairs them.
        </p>
      </div>

      <div className="mt-10">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-3 mb-3">
          Try one
        </div>
        <div className="flex flex-col gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => onPrompt(ex.prompt)}
              className="text-left bg-bg-surface border border-rule rounded-xl px-4 py-3 hover:border-accent transition-colors group"
            >
              <div className="font-serif text-base text-ink">{ex.label}</div>
              <div className="text-[12px] text-ink-3 mt-0.5 line-clamp-1">{ex.prompt}</div>
            </button>
          ))}
        </div>
      </div>

      {!hasKey && (
        <div className="mt-8 bg-accent-soft border border-[#ecd1c5] rounded-xl px-4 py-3 flex items-start justify-between gap-3">
          <div>
            <div className="font-medium text-ink text-sm">Add your Anthropic API key</div>
            <div className="text-ink-2 text-[12px] mt-0.5">
              Until then, generation runs in mock mode with canned content.
            </div>
          </div>
          <button onClick={onSetKey} className="btn btn-primary shrink-0">Set key</button>
        </div>
      )}
    </div>
  );
}
