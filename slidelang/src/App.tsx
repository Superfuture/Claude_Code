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
import { SettingsDialog } from "./editor/SettingsDialog";
import { getAnthropicKey } from "./ai/key";
import { HeaderMenu } from "./editor/HeaderMenu";
import { EmptyState } from "./editor/EmptyState";
import type { TDeck } from "./spec/schema";

const HISTORY_LIMIT = 30;
const isMac = typeof navigator !== "undefined" && /Mac|iPhone/.test(navigator.platform);
const META_LABEL = isMac ? "⌘" : "Ctrl";

export default function App() {
  const [yaml, setYamlRaw] = useState<string>(Q3_BOARD_UPDATE_YAML);
  const [history, setHistory] = useState<string[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [openIssue, setOpenIssue] = useState<Issue | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [suggestion, setSuggestion] = useState<RepairSuggestion | null>(null);
  const [repairBusy, setRepairBusy] = useState(false);
  const [overflowIssues, setOverflowIssues] = useState<Issue[]>([]);
  const [showCode, setShowCode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [hasKey, setHasKey] = useState(() => !!getAnthropicKey());
  const [genError, setGenError] = useState<string | null>(null);
  const lastGoodDeck = useRef<TDeck | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);

  // ---- YAML setter that records undo history ----
  const setYaml = useCallback((next: string, record: boolean = true) => {
    setYamlRaw((prev) => {
      if (next === prev) return prev;
      if (record) {
        setHistory((h) => {
          const out = [...h, prev];
          return out.length > HISTORY_LIMIT ? out.slice(out.length - HISTORY_LIMIT) : out;
        });
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setYamlRaw(last);
      return h.slice(0, -1);
    });
  }, []);

  // Load from URL hash on first mount.
  useEffect(() => {
    if (!window.location.hash) return;
    decodeDeckFromHash(window.location.hash).then((decoded) => {
      if (decoded) setYamlRaw(decoded);
    });
  }, []);

  const compiled = useMemo(() => compile(yaml), [yaml]);
  const deck = compiled.ok ? compiled.deck : lastGoodDeck.current;

  // Remember last-good deck for fallback rendering during YAML edit errors.
  useEffect(() => {
    if (compiled.ok) lastGoodDeck.current = compiled.deck;
  }, [compiled]);

  const staticIssues = useMemo<Issue[]>(
    () => (compiled.ok ? validate(compiled.deck) : []),
    [compiled]
  );
  const issues = useMemo<Issue[]>(
    () => [...staticIssues, ...overflowIssues],
    [staticIssues, overflowIssues]
  );

  // Clamp active slide.
  useEffect(() => {
    if (deck && activeSlide >= deck.slides.length) {
      setActiveSlide(Math.max(0, deck.slides.length - 1));
    }
  }, [deck, activeSlide]);

  const onOverflow = useCallback((slideIssues: Issue[]) => {
    setOverflowIssues((prev) => {
      const slideIds = new Set(slideIssues.map((i) => i.slideId));
      const kept = prev.filter(
        (i) => i.kind !== "overflow" || !slideIds.has(i.slideId)
      );
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
    async (issue: Issue, anchor: { x: number; y: number }) => {
      setOpenIssue(issue);
      setPopoverPos(anchor);
      setSuggestion(null);
      setRepairBusy(true);
      if (!deck) { setRepairBusy(false); return; }
      const slide = deck.slides.find((s) => s.id === issue.slideId);
      if (!slide) { setRepairBusy(false); return; }
      const blockId = issue.kind === "collision" ? issue.aId : (issue as any).blockId;
      const block = slide.blocks.find((b) => b.id === blockId);
      if (!block) { setRepairBusy(false); return; }
      const result = await repairIssue(issue, block);
      setSuggestion(result);
      setRepairBusy(false);
    },
    [deck]
  );

  const applyPatch = useCallback(
    (patch: any) => {
      if (!openIssue || !deck) return;
      const blockId = openIssue.kind === "collision" ? openIssue.aId : (openIssue as any).blockId;
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
        const node = blocks.items[i];
        const nodeId = node.get?.("id") ?? `${openIssue.slideId}-b${i}`;
        if (nodeId === blockId) { blkIdx = i; break; }
      }
      if (blkIdx < 0) return;
      const node = blocks.items[blkIdx];
      Object.entries(patch).forEach(([k, v]) => { node.set(k, v); });
      setYaml(doc.toString());
      setOpenIssue(null);
      setSuggestion(null);
      setPopoverPos(null);
    },
    [openIssue, deck, yaml, setYaml]
  );

  // ---- Generation with streaming ----
  const cancelGen = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setGenerating(false);
  }, []);

  const onGenerate = useCallback(async (overridePrompt?: string) => {
    const p = (overridePrompt ?? prompt).trim();
    if (!p) return;
    if (overridePrompt) setPrompt(p);
    setGenerating(true);
    setGenError(null);
    setActiveSlide(0);
    setYaml("", true);  // record current as undo entry, clear preview
    const controller = new AbortController();
    abortRef.current = controller;
    const r = await generateDeck(p, {
      signal: controller.signal,
      onDelta: (_chunk, full) => {
        // Strip code fences if present, even mid-stream.
        const cleaned = full
          .replace(/^```ya?ml\s*\n?/i, "")
          .replace(/```\s*$/i, "");
        setYamlRaw(cleaned);
      },
    });
    abortRef.current = null;
    setGenerating(false);
    if (r.ok && r.yaml) {
      setYamlRaw(r.yaml);
      if (r.source === "mock") {
        setShareNotice("Mock deck — add API key for real generation");
        setTimeout(() => setShareNotice(null), 3000);
      }
    } else if (r.error) {
      setGenError(r.error);
    }
  }, [prompt, setYaml]);

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

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "k") { e.preventDefault(); promptInputRef.current?.focus(); promptInputRef.current?.select(); }
      else if (mod && e.key === "p" && !e.shiftKey) { e.preventDefault(); if (deck) setPresenting(true); }
      else if (mod && e.key === "/") { e.preventDefault(); setShowCode((s) => !s); }
      else if (mod && e.key === "z" && !e.shiftKey) {
        // Only intercept ⌘Z when focus is NOT in Monaco — let Monaco handle its own undo.
        const t = e.target as HTMLElement;
        if (t?.closest(".monaco-editor")) return;
        e.preventDefault();
        undo();
      }
      else if (e.key === "Escape") {
        setOpenIssue(null);
        setSuggestion(null);
        setPopoverPos(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck, undo]);

  // ---- Render ----
  if (presenting && deck) {
    return <PresentMode deck={deck} onClose={() => setPresenting(false)} />;
  }

  const isEmpty = !deck || (deck.slides.length === 1 && deck.slides[0].blocks.length <= 1 && yaml.trim() === EMPTY_DECK_YAML.trim());

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-4 border-b border-rule px-5 py-3 bg-bg-surface/70 backdrop-blur">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-6 h-6 rounded-md relative" style={{
            background: "linear-gradient(135deg, #c96442 0%, #e58b6c 100%)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
          }}>
            <div className="absolute inset-[5px] bottom-[10px] bg-white/85 rounded-sm" />
            <div className="absolute left-[5px] right-[9px] bottom-[5px] h-[2px] bg-white/85 rounded-[1px]" />
          </div>
          <div className="font-serif text-lg font-semibold tracking-tight">Slidelang</div>
        </div>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="relative flex-1 max-w-xl">
            <input
              ref={promptInputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onGenerate()}
              placeholder={`Describe a deck… (${META_LABEL}K to focus)`}
              className="w-full bg-bg-surface border border-rule rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-accent transition-colors"
              disabled={generating}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
              width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" strokeLinecap="round" />
            </svg>
          </div>
          {generating ? (
            <button onClick={cancelGen} className="btn btn-ghost">
              <span className="w-2 h-2 rounded-full bg-[#b04a3a] animate-pulse" />
              Cancel
            </button>
          ) : (
            <button
              onClick={() => onGenerate()}
              disabled={!prompt.trim()}
              className="btn btn-primary"
            >
              Generate
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-ghost"
            title={hasKey ? "Anthropic API key configured" : "Add Anthropic API key"}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: hasKey ? "#4f7d52" : "#b8722b" }}
            />
            {hasKey ? "Key" : "Set key"}
          </button>
          <button
            onClick={() => setPresenting(true)}
            className="btn btn-primary"
            disabled={!deck}
            title={`Present (${META_LABEL}P)`}
          >
            Present
          </button>
          <HeaderMenu
            items={[
              { label: showCode ? "Hide code" : "Show code", shortcut: `${META_LABEL}/`, onClick: () => setShowCode((s) => !s) },
              { label: "Share link", onClick: onShare },
              { label: "Undo last change", shortcut: `${META_LABEL}Z`, onClick: undo },
              { divider: true, label: "", onClick: () => {} },
              { label: "Load example", onClick: () => setYaml(Q3_BOARD_UPDATE_YAML) },
              { label: "New deck", onClick: () => setYaml(EMPTY_DECK_YAML) },
            ]}
          />
        </div>
      </header>

      {showSettings && (
        <SettingsDialog
          onClose={() => {
            setHasKey(!!getAnthropicKey());
            setShowSettings(false);
          }}
        />
      )}

      {genError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#b04a3a] text-white px-4 py-2 rounded-lg text-sm shadow-lg max-w-[600px]">
          <div className="flex items-start gap-2">
            <span>{genError}</span>
            <button onClick={() => setGenError(null)} className="text-white/80 hover:text-white">×</button>
          </div>
        </div>
      )}

      {shareNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-ink text-bg px-4 py-2 rounded-lg text-sm shadow-lg">
          {shareNotice}
        </div>
      )}

      {/* Compile error (non-blocking — preview keeps showing last-good) */}
      {!compiled.ok && !generating && (
        <div className="fixed bottom-5 left-5 z-40 bg-bg-surface border border-[#b04a3a]/40 rounded-xl shadow-lg max-w-[420px] text-xs overflow-hidden">
          <div className="flex items-center gap-2 bg-[#b04a3a]/10 px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b04a3a]" />
            <span className="font-semibold text-[#b04a3a] uppercase tracking-wider text-[10px]">YAML errors — preview frozen</span>
          </div>
          <ul className="font-mono p-3 space-y-0.5 max-h-32 overflow-auto">
            {compiled.errors.slice(0, 4).map((e, i) => (
              <li key={i} className="text-ink-2">· {e.path ? `${e.path} — ` : ""}{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Body */}
      <div
        className="flex-1 grid min-h-0"
        style={{
          gridTemplateColumns: showCode
            ? "180px minmax(0,1.7fr) minmax(0,1fr)"
            : "180px minmax(0,1fr)",
        }}
      >
        {/* Filmstrip */}
        <aside className="border-r border-rule bg-bg-surface/60 min-h-0 overflow-hidden">
          {deck && (
            <Filmstrip
              deck={deck}
              active={activeSlide}
              issues={issues}
              onSelect={setActiveSlide}
              generating={generating}
              expectedSlides={generating ? 6 : undefined}
            />
          )}
        </aside>

        {/* Preview pane */}
        <main
          className="border-r border-rule p-8 overflow-auto min-h-0 flex items-center justify-center relative"
          onClick={() => { setOpenIssue(null); setSuggestion(null); setPopoverPos(null); }}
        >
          <div className="w-full max-w-[900px] relative">
            {isEmpty && !generating ? (
              <EmptyState
                hasKey={hasKey}
                onSetKey={() => setShowSettings(true)}
                onPrompt={(p) => { setPrompt(p); setTimeout(() => onGenerate(p), 50); }}
              />
            ) : deck && deck.slides[activeSlide] ? (
              <SlideView
                slide={deck.slides[activeSlide]}
                deck={deck}
                issues={issues}
                onOverflow={onOverflow}
                onPillClick={onPillClick}
              />
            ) : null}

            {openIssue && deck && popoverPos && (
              <div
                className="absolute"
                style={{
                  left: Math.min(popoverPos.x, 540),
                  top: popoverPos.y,
                  zIndex: 30,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <RepairPopover
                  issue={openIssue}
                  deck={deck}
                  suggestion={suggestion}
                  busy={repairBusy}
                  onApply={applyPatch}
                  onClose={() => { setOpenIssue(null); setSuggestion(null); setPopoverPos(null); }}
                />
              </div>
            )}

            {/* Issue / success strip */}
            {!isEmpty && (
              <div className="mt-6 flex flex-wrap gap-2 items-center">
                {issues.length === 0 ? (
                  <div className="success-chip">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path className="checkmark" d="M3 8.5 L6.5 12 L13 4.5" />
                    </svg>
                    Deck is panel-ready
                  </div>
                ) : (
                  issues.map((iss, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!deck) return;
                        const slideIdx = deck.slides.findIndex((s) => s.id === iss.slideId);
                        if (slideIdx >= 0) setActiveSlide(slideIdx);
                        const target = e.currentTarget.getBoundingClientRect();
                        setTimeout(() => onPillClick(iss, { x: target.left, y: target.bottom + 4 }), 50);
                      }}
                      className="text-[11px] bg-bg-surface border border-rule rounded-full px-2.5 py-1 hover:border-accent transition-colors"
                    >
                      <span className="text-[#b04a3a] font-semibold uppercase tracking-wider mr-1.5">{iss.kind}</span>
                      <span className="text-ink-2">{iss.message}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </main>

        {/* YAML editor */}
        {showCode && (
        <aside className="min-h-0 flex flex-col">
          <div className="flex items-center justify-between border-b border-rule px-3 py-2 bg-bg-surface/60">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-3">deck.yaml</div>
            <div className="text-[11px] text-ink-3">
              {compiled.ok
                ? `${compiled.deck.slides.length} slides · ${compiled.deck.slides.reduce((n, s) => n + s.blocks.length, 0)} blocks`
                : <span className="text-[#b04a3a]">errors</span>}
            </div>
          </div>
          <div className="monaco-host flex-1">
            <Editor
              defaultLanguage="yaml"
              value={yaml}
              onChange={(v) => setYamlRaw(v ?? "")}
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
        )}
      </div>
    </div>
  );
}
