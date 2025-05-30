import { useNavigate } from "@solidjs/router";
import { addSeconds } from "date-fns";
import type {
  IPanePrimitivePaneView,
  IPrimitivePaneRenderer,
  PaneAttachedParameter,
  Time,
} from "lightweight-charts";
import { createMemo, createSignal } from "solid-js";

import { type PanePrimitive, TimeChart } from "../../src";

// Watermark Primitive - draws a text watermark in the background
class WatermarkPrimitive implements PanePrimitive<Time> {
  private _paneViews: WatermarkPaneView[];
  private _text: string;
  private _color: string;
  private _fontSize: number;

  constructor(text: string, color = "rgba(128, 128, 128, 0.3)", fontSize = 48) {
    this._text = text;
    this._color = color;
    this._fontSize = fontSize;
    this._paneViews = [new WatermarkPaneView(this)];
  }

  updateAllViews() {
    this._paneViews.forEach((pv) => pv.update());
  }

  paneViews() {
    return this._paneViews;
  }

  getText() {
    return this._text;
  }

  getColor() {
    return this._color;
  }

  getFontSize() {
    return this._fontSize;
  }

  attached(_param: PaneAttachedParameter<Time>) {
    // Pane primitives can use this for initialization
  }

  detached() {
    // Cleanup if needed
  }
}

class WatermarkPaneView implements IPanePrimitivePaneView {
  private _source: WatermarkPrimitive;
  private _renderer: WatermarkPaneRenderer;

  constructor(source: WatermarkPrimitive) {
    this._source = source;
    this._renderer = new WatermarkPaneRenderer();
  }

  update() {
    // For watermarks, we don't need complex coordinate calculations
    // Just pass the configuration to the renderer
    this._renderer.setData({
      text: this._source.getText(),
      color: this._source.getColor(),
      fontSize: this._source.getFontSize(),
    });
  }

  renderer() {
    return this._renderer;
  }

  zOrder() {
    return "bottom" as const;
  }
}

class WatermarkPaneRenderer implements IPrimitivePaneRenderer {
  private _data: { text: string; color: string; fontSize: number } | null = null;

  setData(data: { text: string; color: string; fontSize: number } | null) {
    this._data = data;
  }

  draw(target: {
    useBitmapCoordinateSpace: (
      callback: (scope: {
        context: CanvasRenderingContext2D;
        bitmapSize: { width: number; height: number };
      }) => void,
    ) => void;
  }) {
    if (!this._data) return;

    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const { width, height } = scope.bitmapSize;

      ctx.save();
      ctx.font = `${this._data!.fontSize}px Arial`;
      ctx.fillStyle = this._data!.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw watermark in center of pane
      ctx.fillText(this._data!.text, width / 2, height / 2);
      ctx.restore();
    });
  }
}

// Grid Overlay Primitive - draws custom grid lines
class GridOverlayPrimitive implements PanePrimitive<Time> {
  private _paneViews: GridOverlayPaneView[];
  private _spacing: number;
  private _color: string;

  constructor(spacing = 50, color = "rgba(200, 200, 200, 0.2)") {
    this._spacing = spacing;
    this._color = color;
    this._paneViews = [new GridOverlayPaneView(this)];
  }

  updateAllViews() {
    this._paneViews.forEach((pv) => pv.update());
  }

  paneViews() {
    return this._paneViews;
  }

  getSpacing() {
    return this._spacing;
  }

  getColor() {
    return this._color;
  }

  attached(_param: PaneAttachedParameter<Time>) {}

  detached() {}
}

class GridOverlayPaneView implements IPanePrimitivePaneView {
  private _source: GridOverlayPrimitive;
  private _renderer: GridOverlayPaneRenderer;

  constructor(source: GridOverlayPrimitive) {
    this._source = source;
    this._renderer = new GridOverlayPaneRenderer();
  }

  update() {
    this._renderer.setData({
      spacing: this._source.getSpacing(),
      color: this._source.getColor(),
    });
  }

  renderer() {
    return this._renderer;
  }

  zOrder() {
    return "bottom" as const;
  }
}

class GridOverlayPaneRenderer implements IPrimitivePaneRenderer {
  private _data: { spacing: number; color: string } | null = null;

  setData(data: { spacing: number; color: string } | null) {
    this._data = data;
  }

  draw(target: {
    useBitmapCoordinateSpace: (
      callback: (scope: {
        context: CanvasRenderingContext2D;
        bitmapSize: { width: number; height: number };
      }) => void,
    ) => void;
  }) {
    if (!this._data) return;

    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const { width, height } = scope.bitmapSize;

      ctx.save();
      ctx.strokeStyle = this._data!.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      // Draw vertical lines
      for (let x = 0; x < width; x += this._data!.spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y < height; y += this._data!.spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.restore();
    });
  }
}

// Corner Badge Primitive - shows information in corner
class CornerBadgePrimitive implements PanePrimitive<Time> {
  private _paneViews: CornerBadgePaneView[];
  private _text: string;
  private _position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  private _backgroundColor: string;
  private _textColor: string;

  constructor(
    text: string,
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" = "top-right",
    backgroundColor = "rgba(0, 0, 0, 0.8)",
    textColor = "white",
  ) {
    this._text = text;
    this._position = position;
    this._backgroundColor = backgroundColor;
    this._textColor = textColor;
    this._paneViews = [new CornerBadgePaneView(this)];
  }

  updateAllViews() {
    this._paneViews.forEach((pv) => pv.update());
  }

  paneViews() {
    return this._paneViews;
  }

  getText() {
    return this._text;
  }

  getPosition() {
    return this._position;
  }

  getBackgroundColor() {
    return this._backgroundColor;
  }

  getTextColor() {
    return this._textColor;
  }

  setText(text: string) {
    this._text = text;
  }

  attached(_param: PaneAttachedParameter<Time>) {}

  detached() {}
}

class CornerBadgePaneView implements IPanePrimitivePaneView {
  private _source: CornerBadgePrimitive;
  private _renderer: CornerBadgePaneRenderer;

  constructor(source: CornerBadgePrimitive) {
    this._source = source;
    this._renderer = new CornerBadgePaneRenderer();
  }

  update() {
    this._renderer.setData({
      text: this._source.getText(),
      position: this._source.getPosition(),
      backgroundColor: this._source.getBackgroundColor(),
      textColor: this._source.getTextColor(),
    });
  }

  renderer() {
    return this._renderer;
  }

  zOrder() {
    return "top" as const;
  }
}

class CornerBadgePaneRenderer implements IPrimitivePaneRenderer {
  private _data: {
    text: string;
    position: string;
    backgroundColor: string;
    textColor: string;
  } | null = null;

  setData(
    data: {
      text: string;
      position: string;
      backgroundColor: string;
      textColor: string;
    } | null,
  ) {
    this._data = data;
  }

  draw(target: {
    useBitmapCoordinateSpace: (
      callback: (scope: {
        context: CanvasRenderingContext2D;
        bitmapSize: { width: number; height: number };
      }) => void,
    ) => void;
  }) {
    if (!this._data) return;

    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const { width, height } = scope.bitmapSize;

      ctx.save();
      ctx.font = "12px Arial";
      ctx.textBaseline = "top";

      const textMetrics = ctx.measureText(this._data!.text);
      const textWidth = textMetrics.width;
      const textHeight = 16;
      const padding = 8;
      const badgeWidth = textWidth + padding * 2;
      const badgeHeight = textHeight + padding * 2;

      let x: number, y: number;

      switch (this._data!.position) {
        case "top-left":
          x = 10;
          y = 10;
          break;
        case "top-right":
          x = width - badgeWidth - 10;
          y = 10;
          break;
        case "bottom-left":
          x = 10;
          y = height - badgeHeight - 10;
          break;
        case "bottom-right":
          x = width - badgeWidth - 10;
          y = height - badgeHeight - 10;
          break;
        default:
          x = width - badgeWidth - 10;
          y = 10;
      }

      // Draw background
      ctx.fillStyle = this._data!.backgroundColor;
      ctx.fillRect(x, y, badgeWidth, badgeHeight);

      // Draw text
      ctx.fillStyle = this._data!.textColor;
      ctx.textAlign = "center";
      ctx.fillText(this._data!.text, x + badgeWidth / 2, y + padding);

      ctx.restore();
    });
  }
}

// Data generation functions
function generateDateSequence(start: string, count: number) {
  const result = [];
  const [year, month, day] = start.split("-");
  const startDate = new Date(Number(year), Number(month) - 1, Number(day));

  for (let i = 0; i < count; i++) {
    const date = addSeconds(startDate, i * 300); // 5-minute intervals
    const timestamp = Math.floor(date.getTime() / 1000);
    result.push(timestamp);
  }

  return result;
}

function generateLineData(timestamps: number[]) {
  return timestamps.map((time, i) => ({
    time: time as Time,
    value: 100 + Math.sin(i / 50) * 10 + Math.random() * 5 + i * 0.02,
  }));
}

function generateVolumeData(timestamps: number[]) {
  return timestamps.map((time, i) => ({
    time: time as Time,
    value: Math.random() * 1000000 + 500000,
    color: i % 2 === 0 ? "rgba(0, 150, 136, 0.8)" : "rgba(255, 82, 82, 0.8)",
  }));
}

export const PanePrimitivesExample = () => {
  const navigate = useNavigate();
  const [selectedPrimitive, setSelectedPrimitive] = createSignal<string>("all");
  const [badgeText, setBadgeText] = createSignal("Live Data");

  // Generate sample data
  const timestamps = generateDateSequence("2024-01-01", 300);
  const lineData = generateLineData(timestamps);
  const volumeData = generateVolumeData(timestamps);

  // Create primitive instances
  const watermark = new WatermarkPrimitive("DEMO CHART", "rgba(128, 128, 128, 0.15)", 64);
  const gridOverlay = new GridOverlayPrimitive(75, "rgba(100, 149, 237, 0.1)");
  const cornerBadge = createMemo(
    () => new CornerBadgePrimitive(badgeText(), "top-right", "rgba(76, 175, 80, 0.9)", "white"),
  );

  // Update badge text periodically to show dynamic updates
  setInterval(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    setBadgeText(`Live: ${timeString}`);
    cornerBadge().setText(`Live: ${timeString}`);
  }, 1000);

  const getPrimitivesForSelection = () => {
    switch (selectedPrimitive()) {
      case "watermark":
        return [watermark];
      case "grid":
        return [gridOverlay];
      case "badge":
        return [cornerBadge()];
      case "all":
      default:
        return [watermark, gridOverlay, cornerBadge()];
    }
  };

  return (
    <div class="container mx-auto p-6">
      {/* Breadcrumb navigation */}
      <div class="mb-4">
        <button
          onClick={() => navigate("/")}
          class="text-blue-600 hover:text-blue-800 flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </button>
      </div>

      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Pane Primitives Example</h1>
        <p class="text-gray-600 mb-4">
          Demonstrates how to create and use pane primitives for drawing on chart panes. Pane
          primitives can draw backgrounds, overlays, decorations, and informational elements across
          the entire pane.
        </p>

        {/* Primitive Selection */}
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedPrimitive("all")}
            class={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPrimitive() === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Primitives
          </button>
          <button
            onClick={() => setSelectedPrimitive("watermark")}
            class={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPrimitive() === "watermark"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Watermark
          </button>
          <button
            onClick={() => setSelectedPrimitive("grid")}
            class={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPrimitive() === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Grid Overlay
          </button>
          <button
            onClick={() => setSelectedPrimitive("badge")}
            class={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPrimitive() === "badge"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Corner Badge
          </button>
        </div>
      </div>

      <div class="grid gap-6">
        {/* Interactive Chart */}
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">Interactive Chart with Pane Primitives</h2>
          <TimeChart
            class="h-[500px] w-full"
            timeScale={{
              timeVisible: true,
              secondsVisible: false,
              barSpacing: 8,
              minBarSpacing: 4,
            }}
            rightPriceScale={{
              visible: true,
              scaleMargins: { top: 0.1, bottom: 0.1 },
            }}
            onCreateChart={(chart) => {
              setTimeout(() => {
                chart.timeScale().setVisibleLogicalRange({
                  from: 50,
                  to: 250,
                });
              }, 100);
            }}
          >
            <TimeChart.Series type="Line" data={lineData} color="#26A69A" lineWidth={2} />
            <TimeChart.Pane primitives={getPrimitivesForSelection()}>
              <TimeChart.Series type="Histogram" data={volumeData} priceScaleId="volume" />
            </TimeChart.Pane>
          </TimeChart>
        </div>

        {/* Documentation */}
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">Pane Primitive Types & Features</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium mb-3 text-blue-600">Watermark Primitive</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Draws text watermarks in the background</li>
                <li>• Centered positioning with custom opacity</li>
                <li>• Uses "bottom" z-order for background rendering</li>
                <li>• Configurable font size and color</li>
                <li>• Perfect for branding or demo indicators</li>
              </ul>

              <h3 class="text-lg font-medium mb-3 mt-6 text-purple-600">Grid Overlay</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Custom grid patterns over chart panes</li>
                <li>• Configurable spacing and line styles</li>
                <li>• Semi-transparent for subtle visual guides</li>
                <li>• Dashed lines for distinction from chart grid</li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-3 text-green-600">Corner Badge</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Information badges in pane corners</li>
                <li>• Dynamic text updates (live clock example)</li>
                <li>• Configurable positioning and styling</li>
                <li>• Uses "top" z-order for visibility</li>
                <li>• Great for status indicators or metadata</li>
              </ul>

              <h3 class="text-lg font-medium mb-3 mt-6 text-orange-600">Use Cases</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Chart branding and watermarks</li>
                <li>• Custom grid and measurement guides</li>
                <li>• Status indicators and live information</li>
                <li>• Decorative elements and backgrounds</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Code Structure */}
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">Pane Primitive Implementation Structure</h2>
          <div class="bg-gray-50 p-4 rounded-lg">
            <pre class="text-sm text-gray-800 overflow-x-auto">
              <code>{`// Basic Pane Primitive Structure
class MyPanePrimitive {
  constructor(options) {
    this._paneViews = [new MyPaneView(this)];
    // Store configuration
  }

  // Required methods
  updateAllViews() {
    this._paneViews.forEach(pv => pv.update());
  }

  paneViews() { return this._paneViews; }

  // Lifecycle methods
  attached(param) {
    // Access to pane API if needed
  }

  detached() {
    // Cleanup
  }
}

// Pane View - handles updates and provides renderer
class MyPaneView {
  update() {
    // Update renderer data based on pane state
    this._renderer.setData({ ... });
  }

  renderer() { return this._renderer; }
  zOrder() { return 'bottom'; } // 'bottom', 'normal', 'top'
}

// Renderer - performs Canvas 2D drawing
class MyPaneRenderer {
  draw(target) {
    target.useBitmapCoordinateSpace(scope => {
      const ctx = scope.context;
      const { width, height } = scope.bitmapSize;
      // Draw using full pane dimensions
    });
  }
}`}</code>
            </pre>
          </div>
        </div>

        {/* Usage Guide */}
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">How to Use Pane Primitives</h2>
          <div class="space-y-4">
            <div>
              <h3 class="font-medium text-gray-900 mb-2">1. Create Primitive Instance</h3>
              <div class="bg-gray-50 p-3 rounded">
                <code class="text-sm">
                  const watermark = new WatermarkPrimitive("DEMO", "rgba(128,128,128,0.3)");
                </code>
              </div>
            </div>

            <div>
              <h3 class="font-medium text-gray-900 mb-2">2. Attach to Pane</h3>
              <div class="bg-gray-50 p-3 rounded">
                <code class="text-sm">{"<TimeChart.Pane primitives={[watermark]} />"}</code>
              </div>
            </div>

            <div>
              <h3 class="font-medium text-gray-900 mb-2">
                3. Key Differences from Series Primitives
              </h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>
                  • <strong>Scope:</strong> Draw across entire pane, not tied to specific data
                  points
                </li>
                <li>
                  • <strong>Coordinates:</strong> Work with pane dimensions, not price/time
                  coordinates
                </li>
                <li>
                  • <strong>Use cases:</strong> Backgrounds, overlays, decorations, metadata display
                </li>
                <li>
                  • <strong>Z-order:</strong> Control layering relative to chart elements
                </li>
                <li>
                  • <strong>Flexibility:</strong> Can create complex graphics spanning entire pane
                  area
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
