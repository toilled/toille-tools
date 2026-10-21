import { createSignal, onSettled, onCleanup, For, Show, type JSX } from 'solid-js';
import JsonTool from './lib/components/JsonTool';
import RegexTool from './lib/components/RegexTool';
import ColourTool from './lib/components/ColourTool';
import EdgeBenchmarkTool from './lib/components/benchmark/EdgeBenchmarkTool';
import Base64Tool from './lib/components/Base64Tool';
import { DEV_TOOLS } from './lib/data/tools';
import './lib/components/ToolPanel.css';

interface ToolCardProps {
  id: string;
  badge: string;
  title: string;
  color: string;
  desc: string;
  children: JSX.Element;
}

function ToolCard(props: ToolCardProps) {
  return (
    <section id={props.id} class="tool-section-wrapper" aria-label={props.title}>
      <div class="tool-header-row">
        <div>
          <span
            class="tool-badge-pill mono"
            style={{ color: props.color, 'border-color': props.color }}
          >
            {props.badge}
          </span>
          <h2 class="tool-title" style={{ 'margin-top': '0.5rem', color: props.color }}>
            {props.title}
          </h2>
          <p class="tool-desc">{props.desc}</p>
        </div>
      </div>
      {props.children}
    </section>
  );
}

function ToolsNav(props: { activeTab: () => string; onSelect: (id: string) => void }) {
  return (
    <header class="tools-nav" role="banner">
      <div class="tools-brand">
        <a href="https://toille.uk" class="tools-back-btn">
          ← TOILLE.UK
        </a>
        <div class="tools-title-group">
          <h1 class="tools-main-title">TOILLE TOOLS</h1>
          <span class="tools-subtitle">DEV UTILITY SUITE // BROWSER-SIDE EXECUTION</span>
        </div>
      </div>

      <nav class="tools-tabs" aria-label="Tool selection">
        <button
          type="button"
          class={`tools-tab-btn ${props.activeTab() === 'all' ? 'active' : ''}`}
          onClick={() => props.onSelect('all')}
        >
          ✦ ALL TOOLS
        </button>
        <For each={DEV_TOOLS}>
          {(tool) => (
            <button
              type="button"
              class={`tools-tab-btn ${props.activeTab() === tool.id ? 'active' : ''}`}
              onClick={() => props.onSelect(tool.id)}
            >
              <span>{tool.name}</span>
            </button>
          )}
        </For>
      </nav>
    </header>
  );
}

const KNOWN_TABS = new Set(['json', 'regex', 'colour', 'edge', 'base64']);

export default function App() {
  const [activeTab, setActiveTab] = createSignal<string>('all');

  const updateFromHash = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (KNOWN_TABS.has(hash)) {
      setActiveTab(hash);
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab('all');
    }
  };

  onSettled(() => {
    updateFromHash();
    window.addEventListener('hashchange', updateFromHash);
  });

  onCleanup(() => {
    window.removeEventListener('hashchange', updateFromHash);
  });

  const selectTab = (id: string) => {
    setActiveTab(id);
    if (id === 'all') {
      window.history.pushState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.pushState(null, '', `#${id}`);
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isVisible = (tab: string) => activeTab() === 'all' || activeTab() === tab;

  return (
    <div class="tools-shell">
      <ToolsNav activeTab={activeTab} onSelect={selectTab} />

      <main class="tools-content" role="main">
        <Show when={isVisible('json')}>
          <ToolCard
            id="json"
            badge="MODULE // JSON_LAB"
            title="JSON Formatter & Validator"
            color="var(--cyan)"
            desc="Parse, format, minify, and inspect JSON documents with instant error feedback."
          >
            <JsonTool />
          </ToolCard>
        </Show>

        <Show when={isVisible('regex')}>
          <ToolCard
            id="regex"
            badge="MODULE // REGEX_LAB"
            title="Regex Tester"
            color="var(--pink)"
            desc="Build and test regular expressions live with real-time match highlighting."
          >
            <RegexTool />
          </ToolCard>
        </Show>

        <Show when={isVisible('colour')}>
          <ToolCard
            id="colour"
            badge="MODULE // COLOUR_STUDIO"
            title="Colour Converter & Swatch"
            color="var(--yellow)"
            desc="Convert between HEX, RGB, HSL, and named CSS colours with one-click copy."
          >
            <ColourTool />
          </ToolCard>
        </Show>

        <Show when={isVisible('edge')}>
          <ToolCard
            id="edge"
            badge="MODULE // EDGE_TELEMETRY"
            title="Edge Latency Probe"
            color="var(--blue)"
            desc="Benchmark round-trip network performance and latency distributions."
          >
            <EdgeBenchmarkTool />
          </ToolCard>
        </Show>

        <Show when={isVisible('base64')}>
          <ToolCard
            id="base64"
            badge="MODULE // ENCODE_LAB"
            title="Base64 & URL Converter"
            color="var(--purple)"
            desc="Encode and decode text strings to Base64, URL-safe Base64, and URI components."
          >
            <Base64Tool />
          </ToolCard>
        </Show>
      </main>

      <footer class="tool-footer" role="contentinfo">
        <span class="mono">🔒 100% Client-Side Execution · Zero Remote Data Collection · Zero Ads</span>
        <span class="mono">
          Engineered by{' '}
          <a href="https://toille.uk" style={{ color: 'var(--blue)' }}>
            Elliot Dickerson
          </a>
        </span>
      </footer>
    </div>
  );
}
