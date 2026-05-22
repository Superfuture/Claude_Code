import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import YAML from "yaml";
import { compile } from "./compiler/compile";
import { validate, type Issue } from "./validator/validate";
import { SlideView } from "./editor/SlideView";
import { Filmstrip } from "./editor/Filmstrip";
import { RepairPopover } from "./editor/RepairPopover";
import { PresentMode } from "./editor/PresentMode";
import { Q3_BOARD_UPDATE_YAML, EMPTY_DECK_YAML } from "./spec/examples";
import { generateDeck, repairIssue, type RepairSuggestion } from "./ai/client";
import { buildShareUrl, decodeDeckFromHash } from "./share/share";

export default function App() {
  const [yaml, setYaml] = useState<string>(Q3_BOARD_UPDATE_YAML);
  const [activeSlide, setActiveSlide] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [openIssue, setOpenIssue] = useState<Issue | null>(null);
  const [suggestion, setSuggestion] = useState<RepairSuggestion | null>(null);
  const [repairBusy, setRepairBusy] = useState(false);
  const [overflowIssues, setOverflowIssues] = useState<Issue[]>([]);

  // Load deck from URL hash on first mount.
  useEffect(() => {
    if (!window.location.hash) return;
    decodeDeckFromHash(window.location.hash).then((decoded) => {
      if (decoded) setYaml(decoded);
    });
  }, []);

  const compiled = useMemo(() => compile(yaml), [yaml]);
  const deck = compiled.ok ? compiled.deck : null;

  // Static (geometry + contrast + chart) issues, recomputed when deck changes.
  const staticIssues = useMemo<Issue[]>(() => (deck ? validate(deck) : []), [deck]);
  const issues = useMemo<Issue[]>(() => [...staticIssues, ...overflowIssues], [staticIssues, overflowIssues]);

  // Clamp active slide if YAML shrinks.
  useEffect(() => {
    if (deck && activeSlide >= deck.slides.length) {
      setActiveSlide(Math.max(0, deck.slides.length - 1));
    }
  }, [deck, activeSlide]);

  const onOverflow = useCallback((slideIssues: Issue[]) => {
    setOverflowIssues((prev) => {
      // Replace this slide's overflow issues only.
      const slideIds = new Set(slideIssues.map((i) => i.slideId));
      const kept = prev.filter(
        (i) => i.kind !== "overflow" || !slideIds.has(i.slideId)
      );
      // Also replace the active slide's old overflow even if no new issues
      if (deck) {
        const active = deck.slides[activeSlide]?.id;
        if (active && !slideIds.has(active)) {
          return [
            ...kept.filter((i) => !(i.kind === "overflow" && i.slideId === active)),
            ...slideIssues,
          ];
        }
      }
      return [...kept, ...slideIssues];
    });
  }, [deck, activeSlide]);

  const onPillClick = useCallback(
    async (issue: Issue) => {
      setOpenIssue(issue);
      setSuggestion(null);
      setRepairBusy(true);
      if (!deck) return;
      const slide = deck.slides.find((s) => s.id === issue.slideId);
      if (!slide) return;
      const blockId =
        issue.kind === "collision" ? issue.aId :
        (issue as any).blockId;
      const block = slide.blocks.find((b) => b.id === blockId);
      if (!block) {
        setRepairBusy(false);
        return;
      }
      const result = await repairIssue(issue, block);
      setSuggestion(result);
      setRepairBusy(false);
    },
    [deck]
  );

  const applyPatch = useCallback(
    (patch: any) => {
      if (!openIssue || !deck) return;
      const slide = deck.slides.find((s) => s.id === openIssue.slideId);
      if (!slide) return;
      const blockId =
        openIssue.kind === "collision" ? openIssue.aId :
        (openIssue as any).blockId;

      // Mutate the parsed deck via the YAML AST so we preserve formatting.
      const doc = YAML.parseDocument(yaml);
      const slides = doc.get("slides") as any;
      if (!slides) return;
      let idx = -1;
      for (let i = 0; i < slides.items.length; i++) {
        if (slides.items[i].get("id") === openIssue.slideId) { idx = i; break; }
      }
      if (idx < 0) return;
      const blocks = slides.items[idx].get("blocks");
      let blkIdx = -1;
      for (let i = 0; i < blocks.items.length; i++) {
        // We assigned IDs at compile time; some blocks may not have one in YAML.
        const node = blocks.items[i];
        const nodeId = node.get?.("id") ?? `${openIssue.slideId}-b${i}`;
        if (nodeId === blockId) { blkIdx = i; break; }
      }
      if (blkIdx < 0) return;
      const node = blocks.items[blkIdx];
      Object.entries(patch).forEach(([k, v]) => {
        node.set(k, v);
      });
      setYaml(doc.toString());
      setOpenIssue(null);
      setSuggestion(null);
    },
    [openIssue, deck, yaml]
  );

  const onGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    const r = await generateDeck(prompt);
    setGenerating(false);
    if (r.ok && r.yaml) {
      setYaml(r.yaml);
      setActiveSlide(0);
    }
  }, [prompt]);

  const onShare = useCallback(async () => {
    const url = await buildShareUrl(yaml);
    try {
      await navigator.clipboard.writeText(url);
      setShareNotice("Share URL copied");
      setTimeout(() => setShareNotice(null), 2200);
    } catch {
      setShareNotice(url);
      setTimeout(() => setShareNotice(null), 4000);
    }
  }, [yaml]);

  if (presenting && deck) {
    return <PresentMode deck={deck} onClose={() => setPresenting(false)} />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-4 border-b border-rule px-5 py-3 bg-bg-surface/70 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md relative" style={{
            background: "linear-gradient(135deg, #c96442 0%, #e58b6c 100%)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
          }}>
            <div className="absolute inset-[5px] bottom-[10px] bg-white/85 rounded-sm" />
            <div className="absolute left-[5px] right-[9px] bottom-[5px] h-[2px] bg-white/85 rounded-[1px]" />
          </div>
          <div className="font-serif text-lg font-semibold tracking-tight">Slidelang</div>
          <div className="text-ink-3 text-xs ml-1">deck-as-code</div>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onGenerate()}
            placeholder='Try: "Q3 board update with ARR chart and LTV formula"'
            className="flex-1 max-w-xl bg-bg-surface border border-rule rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
          />
          <button
            onClick={onGenerate}
            disabled={generating || !prompt.trim()}
            className="btn btn-primary"
          >
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setYaml(Q3_BOARD_UPDATE_YAML)} className="btn btn-ghost">Example</button>
          <button onClick={() => setYaml(EMPTY_DECK_YAML)} className="btn btn-ghost">New</button>
          <button onClick={onShare} className="btn btn-ghost">Share</button>
          <button onClick={() => setPresenting(true)} className="btn btn-primary">Present</button>
        </div>
      </header>

      {/* Toast */}
      {shareNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-ink text-bg px-4 py-2 rounded-lg text-sm shadow-lg">
          {shareNotice}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 grid min-h-0" style={{ gridTemplateColumns: "140px minmax(0,1fr) minmax(0,1fr)" }}>
        {/* Filmstrip */}
        <aside className="border-r border-rule bg-bg-surface/60 min-h-0 overflow-hidden">
          {deck && (
            <Filmstrip
              deck={deck}
              active={activeSlide}
              issues={issues}
              onSelect={setActiveSlide}
            />
          )}
        </aside>

        {/* Preview pane */}
        <main
          className="border-r border-rule p-8 overflow-auto min-h-0 flex items-center justify-center"
          onClick={() => { setOpenIssue(null); setSuggestion(null); }}
        >
          <div className="w-full max-w-[900px] relative">
            {deck && deck.slides[activeSlide] ? (
              <SlideView
                slide={deck.slides[activeSlide]}
                deck={deck}
                issues={issues}
                onOverflow={onOverflow}
                onPillClick={onPillClick}
              />
            ) : !compiled.ok ? (
              <div className="bg-bg-surface border border-rule rounded-lg p-6 text-sm">
                <div className="font-serif text-lg mb-2 text-[#b04a3a]">Compile error</div>
                <ul className="space-y-1 font-mono text-xs text-ink-2">
                  {compiled.errors.map((e, i) => (
                    <li key={i}>· {e.path ? `${e.path} — ` : ""}{e.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {openIssue && deck && (
              <div
                className="absolute"
                style={{ left: "20px", top: "20px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <RepairPopover
                  issue={openIssue}
                  deck={deck}
                  suggestion={suggestion}
                  busy={repairBusy}
                  onApply={applyPatch}
                  onClose={() => { setOpenIssue(null); setSuggestion(null); }}
                />
              </div>
            )}

            {/* Issue summary strip */}
            <div className="mt-6 flex flex-wrap gap-2">
              {issues.length === 0 ? (
                <div className="text-xs text-[#4f7d52] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4f7d52]" />
                  No issues — deck is panel-ready.
                </div>
              ) : (
                issues.map((iss, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!deck) return;
                      const slideIdx = deck.slides.findIndex((s) => s.id === iss.slideId);
                      if (slideIdx >= 0) setActiveSlide(slideIdx);
                      setTimeout(() => onPillClick(iss), 50);
                    }}
                    className="text-[11px] bg-bg-surface border border-rule rounded-full px-2.5 py-1 hover:border-accent transition-colors"
                  >
                    <span className="text-[#b04a3a] font-semibold uppercase tracking-wider mr-1.5">{iss.kind}</span>
                    <span className="text-ink-2">{iss.message}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </main>

        {/* YAML editor */}
        <aside className="min-h-0 flex flex-col">
          <div className="flex items-center justify-between border-b border-rule px-3 py-2 bg-bg-surface/60">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-3">deck.yaml</div>
            <div className="text-[11px] text-ink-3">{compiled.ok ? `${compiled.deck.slides.length} slides · ${compiled.deck.slides.reduce((n, s) => n + s.blocks.length, 0)} blocks` : "errors"}</div>
          </div>
          <div className="monaco-host flex-1">
            <Editor
              defaultLanguage="yaml"
              value={yaml}
              onChange={(v) => setYaml(v ?? "")}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
                minimap: { enabled: false },
                wordWrap: "on",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                tabSize: 2,
                renderLineHighlight: "none",
                padding: { top: 12, bottom: 12 },
              }}
              theme="vs"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
