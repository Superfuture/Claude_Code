import { useEffect, useRef, useState } from "react";
import katex from "katex";
import vegaEmbed from "vega-embed";
import type { TBlock } from "../spec/schema";
import { resolveImageSrc } from "../ai/images";

function positionStyle(b: TBlock): React.CSSProperties {
  return {
    left: `${b.x}%`,
    top: `${b.y}%`,
    width: `${b.w}%`,
    height: `${b.h}%`,
  };
}

function TextBlock({ b }: { b: Extract<TBlock, { type: "text" }> }) {
  const align = b.align ?? "left";
  const style: React.CSSProperties = {
    ...positionStyle(b),
    color: b.color,
    textAlign: align,
    justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
  };

  if (b.style === "bullets") {
    const lines = b.content.split(/\n+/).map((l) => l.replace(/^•\s*/, ""));
    return (
      <div className="block block-text" data-style="bullets" data-block-id={b.id} style={style}>
        <ul>
          {lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      className="block block-text"
      data-style={b.style}
      data-block-id={b.id}
      style={style}
    >
      <span>{b.content}</span>
    </div>
  );
}

function MathBlock({ b }: { b: Extract<TBlock, { type: "math" }> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(b.latex, ref.current, {
        displayMode: b.display ?? true,
        throwOnError: false,
        strict: "ignore",
      });
    } catch (e) {
      if (ref.current) ref.current.textContent = b.latex;
    }
  }, [b.latex, b.display]);
  return (
    <div
      className="block block-math"
      data-block-id={b.id}
      style={positionStyle(b)}
      ref={ref}
    />
  );
}

function ChartBlock({ b }: { b: Extract<TBlock, { type: "chart" }> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let cancelled = false;
    vegaEmbed(el, b.spec, {
      actions: false,
      renderer: "svg",
      config: {
        background: "transparent",
        font: '-apple-system, system-ui, sans-serif',
      },
    })
      .catch(() => {
        if (cancelled || !el) return;
        el.innerHTML = `<div style="color:#b04a3a; font-size:12px; padding:8px;">Chart error</div>`;
      });
    return () => {
      cancelled = true;
      if (el) el.innerHTML = "";
    };
  }, [JSON.stringify(b.spec)]);
  return (
    <div
      className="block block-chart"
      data-block-id={b.id}
      style={positionStyle(b)}
      ref={ref}
    />
  );
}

function ImageBlock({ b }: { b: Extract<TBlock, { type: "image" }> }) {
  const [src, setSrc] = useState<string>("");
  const sourceKey = JSON.stringify(b.source);
  useEffect(() => {
    let cancelled = false;
    resolveImageSrc(b.source).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [sourceKey]);
  return (
    <div
      className="block block-image"
      data-block-id={b.id}
      style={positionStyle(b)}
    >
      {src ? (
        <img src={src} alt={b.alt ?? ""} style={{ objectFit: b.fit ?? "cover" }} />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, #f4f1ea 0%, #ede8db 100%)",
          }}
        />
      )}
    </div>
  );
}

export function BlockRenderer({ block }: { block: TBlock }) {
  switch (block.type) {
    case "text":
      return <TextBlock b={block} />;
    case "math":
      return <MathBlock b={block} />;
    case "chart":
      return <ChartBlock b={block} />;
    case "image":
      return <ImageBlock b={block} />;
  }
}
