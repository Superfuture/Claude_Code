import { useState } from "react";
import { getAnthropicKey, setAnthropicKey, getModel, setModel, MODEL_CHOICES } from "../ai/key";

interface SettingsDialogProps {
  onClose: () => void;
}

export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const [key, setKey] = useState(getAnthropicKey());
  const [model, setModelLocal] = useState(getModel());
  const [show, setShow] = useState(false);

  const masked = key ? key.slice(0, 7) + "…" + key.slice(-4) : "";

  function save() {
    setAnthropicKey(key);
    setModel(model);
    onClose();
  }

  function clear() {
    setAnthropicKey("");
    setKey("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface border border-rule rounded-2xl shadow-2xl w-[460px] max-w-[90vw] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-serif text-xl font-semibold leading-tight">Anthropic API key</div>
            <div className="text-ink-3 text-xs mt-1">
              Stored only in this browser. Sent to api.anthropic.com directly.
            </div>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink text-2xl leading-none px-1">×</button>
        </div>

        <label className="block text-[11px] uppercase tracking-wider font-semibold text-ink-3 mb-1.5">
          API key
        </label>
        <div className="flex gap-2 mb-1">
          <input
            type={show ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-api03-…"
            className="flex-1 bg-bg border border-rule rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
          />
          <button
            onClick={() => setShow((s) => !s)}
            className="btn btn-ghost"
            type="button"
          >{show ? "Hide" : "Show"}</button>
        </div>
        {key && !show && (
          <div className="text-[11px] text-ink-3 font-mono mb-3">Saved: {masked}</div>
        )}

        <label className="block text-[11px] uppercase tracking-wider font-semibold text-ink-3 mb-1.5 mt-4">
          Model
        </label>
        <select
          value={model}
          onChange={(e) => setModelLocal(e.target.value)}
          className="w-full bg-bg border border-rule rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          {MODEL_CHOICES.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>

        <div className="text-[12px] text-ink-3 mt-5 leading-snug">
          Don't have one? Create a key at{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >console.anthropic.com</a>.
          Calls use <code className="font-mono text-[11px]">anthropic-dangerous-direct-browser-access</code> — your key stays in this browser.
        </div>

        <div className="flex gap-2 justify-end mt-6">
          {key && <button onClick={clear} className="btn btn-ghost">Clear</button>}
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={save} className="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}
