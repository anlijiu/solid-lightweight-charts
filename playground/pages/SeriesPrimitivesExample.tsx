import { useNavigate } from "@solidjs/router";
import { addSeconds } from "date-fns";
import type {
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesPrimitiveAxisView,
  SeriesAttachedParameter,
  Time,
} from "lightweight-charts";
import { createSignal } from "solid-js";

import { type SeriesPrimitive, TimeChart } from "../../src";

// Simple trend line primitive
class TrendLinePrimitive implements SeriesPrimitive<"Line", Time> {
  private _paneViews: TrendLinePaneView[];
  private _priceAxisViews: TrendLinePriceAxisView[];
  private _p1: { time: number; price: number };
  private _p2: { time: number; price: number };
  private _color: string;
  private _chart: unknown = null;
  private _series: unknown = null;

  constructor(
    p1: { time: number; price: number },
    p2: { time: number; price: number },
    color = "#2962FF",
  ) {
    this._p1 = p1;
    this._p2 = p2;
    this._color = color;
    this._paneViews = [new TrendLinePaneView(this)];
    this._priceAxisViews = [new TrendLinePriceAxisView(this)];
  }

  updateAllViews() {
    this._paneViews.forEach((pw) => pw.update());
  }

  paneViews() {
    return this._paneViews;
  }

  priceAxisViews() {
    return this._priceAxisViews;
  }

  getP1() {
    return this._p1;
  }

  getP2() {
    return this._p2;
  }

  getColor() {
    return this._color;
  }

  attached(param: SeriesAttachedParameter<Time, "Line">) {
    this._chart = param.chart;
    this._series = param.series;
  }

  detached() {
    this._chart = null;
    this._series = null;
  }

  getChart() {
    return this._chart;
  }

  getSeries() {
    return this._series;
  }
}

class TrendLinePaneView implements IPrimitivePaneView {
  private _source: TrendLinePrimitive;
  private _renderer: TrendLinePaneRenderer;

  constructor(source: TrendLinePrimitive) {
    this._source = source;
    this._renderer = new TrendLinePaneRenderer();
  }

  update() {
    const chart = this._source.getChart() as {
      timeScale: () => { timeToCoordinate: (time: number) => number | null };
    };
    const series = this._source.getSeries() as {
      priceToCoordinate: (price: number) => number | null;
    };
    if (!chart || !series) return;

    const timeScale = chart.timeScale();
    const p1 = this._source.getP1();
    const p2 = this._source.getP2();

    const x1 = timeScale.timeToCoordinate(p1.time);
    const x2 = timeScale.timeToCoordinate(p2.time);
    const y1 = series.priceToCoordinate(p1.price);
    const y2 = series.priceToCoordinate(p2.price);

    if (x1 === null || x2 === null || y1 === null || y2 === null) {
      this._renderer.setData(null);
      return;
    }

    this._renderer.setData({
      x1,
      y1,
      x2,
      y2,
      color: this._source.getColor(),
    });
  }

  renderer() {
    return this._renderer;
  }

  zOrder() {
    return "normal" as const;
  }
}

class TrendLinePaneRenderer implements IPrimitivePaneRenderer {
  private _data: { x1: number; y1: number; x2: number; y2: number; color: string } | null = null;

  setData(data: { x1: number; y1: number; x2: number; y2: number; color: string } | null) {
    this._data = data;
  }

  draw(target: {
    useBitmapCoordinateSpace: (
      callback: (scope: { context: CanvasRenderingContext2D }) => void,
    ) => void;
  }) {
    if (!this._data) return;

    target.useBitmapCoordinateSpace((scope: { context: CanvasRenderingContext2D }) => {
      const ctx = scope.context;
      ctx.lineWidth = 2;
      ctx.strokeStyle = this._data!.color;
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(this._data!.x1, this._data!.y1);
      ctx.lineTo(this._data!.x2, this._data!.y2);
      ctx.stroke();
    });
  }
}

class TrendLinePriceAxisView implements ISeriesPrimitiveAxisView {
  private _source: TrendLinePrimitive;

  constructor(source: TrendLinePrimitive) {
    this._source = source;
  }

  coordinate() {
    const series = this._source.getSeries() as {
      priceToCoordinate: (price: number) => number | null;
    };
    if (!series) return -1000; // Return large negative number if coordinate unavailable
    const coord = series.priceToCoordinate(this._source.getP2().price);
    return coord ?? -1000;
  }

  text() {
    return this._source.getP2().price.toFixed(2);
  }

  textColor() {
    return "white";
  }

  backColor() {
    return this._source.getColor();
  }

  visible() {
    return true;
  }
}

// Support/Resistance Level Primitive
class SupportResistancePrimitive implements SeriesPrimitive<"Line", Time> {
  private _paneViews: SupportResistancePaneView[];
  private _priceAxisViews: SupportResistancePriceAxisView[];
  private _price: number;
  private _color: string;
  private _label: string;
  private _series: unknown = null;
  private _chart: unknown = null;

  constructor(price: number, label: string, color = "#FF6B35") {
    this._price = price;
    this._label = label;
    this._color = color;
    this._paneViews = [new SupportResistancePaneView(this)];
    this._priceAxisViews = [new SupportResistancePriceAxisView(this)];
  }

  updateAllViews() {
    this._paneViews.forEach((pw) => pw.update());
  }

  paneViews() {
    return this._paneViews;
  }

  priceAxisViews() {
    return this._priceAxisViews;
  }

  getPrice() {
    return this._price;
  }

  getColor() {
    return this._color;
  }

  getLabel() {
    return this._label;
  }

  attached(param: SeriesAttachedParameter<Time, "Line">) {
    this._chart = param.chart;
    this._series = param.series;
  }

  detached() {
    this._chart = null;
    this._series = null;
  }

  getChart() {
    return this._chart;
  }

  getSeries() {
    return this._series;
  }
}

class SupportResistancePaneView implements IPrimitivePaneView {
  private _source: SupportResistancePrimitive;
  private _renderer: SupportResistancePaneRenderer;

  constructor(source: SupportResistancePrimitive) {
    this._source = source;
    this._renderer = new SupportResistancePaneRenderer();
  }

  update() {
    const chart = this._source.getChart() as {
      timeScale: () => {
        getVisibleLogicalRange: () => { from: number; to: number } | null;
        logicalToCoordinate: (logical: number) => number | null;
      };
    };
    const series = this._source.getSeries() as {
      priceToCoordinate: (price: number) => number | null;
    };
    if (!chart || !series) return;

    const timeScale = chart.timeScale();
    const logicalRange = timeScale.getVisibleLogicalRange();
    if (!logicalRange) return;

    const y = series.priceToCoordinate(this._source.getPrice());
    if (y === null) return;

    const x1 = timeScale.logicalToCoordinate(logicalRange.from);
    const x2 = timeScale.logicalToCoordinate(logicalRange.to);

    if (x1 === null || x2 === null) return;

    this._renderer.setData({
      x1,
      x2,
      y,
      price: this._source.getPrice(),
      color: this._source.getColor(),
      label: this._source.getLabel(),
    });
  }

  renderer() {
    return this._renderer;
  }

  zOrder() {
    return "normal" as const;
  }
}

class SupportResistancePaneRenderer implements IPrimitivePaneRenderer {
  private _data: {
    x1: number;
    x2: number;
    y: number;
    price: number;
    color: string;
    label: string;
  } | null = null;

  setData(
    data: { x1: number; x2: number; y: number; price: number; color: string; label: string } | null,
  ) {
    this._data = data;
  }

  draw(target: {
    useBitmapCoordinateSpace: (
      callback: (scope: { context: CanvasRenderingContext2D }) => void,
    ) => void;
  }) {
    if (!this._data) return;

    target.useBitmapCoordinateSpace((scope: { context: CanvasRenderingContext2D }) => {
      const ctx = scope.context;
      ctx.lineWidth = 2;
      ctx.strokeStyle = this._data!.color;
      ctx.setLineDash([5, 5]);

      // Draw horizontal line
      ctx.beginPath();
      ctx.moveTo(this._data!.x1, this._data!.y);
      ctx.lineTo(this._data!.x2, this._data!.y);
      ctx.stroke();

      // Draw label
      ctx.font = "12px Arial";
      ctx.fillStyle = this._data!.color;
      ctx.textAlign = "left";
      ctx.fillText(this._data!.label, this._data!.x1 + 10, this._data!.y - 5);
    });
  }
}

class SupportResistancePriceAxisView implements ISeriesPrimitiveAxisView {
  private _source: SupportResistancePrimitive;

  constructor(source: SupportResistancePrimitive) {
    this._source = source;
  }

  coordinate() {
    const series = this._source.getSeries() as {
      priceToCoordinate: (price: number) => number | null;
    };
    if (!series) return -1000;
    const coord = series.priceToCoordinate(this._source.getPrice());
    return coord ?? -1000;
  }

  text() {
    return `${this._source.getLabel()}: ${this._source.getPrice().toFixed(2)}`;
  }

  textColor() {
    return "white";
  }

  backColor() {
    return this._source.getColor();
  }

  visible() {
    return true;
  }
}

// Price Alert Primitive
class PriceAlertPrimitive implements SeriesPrimitive<"Line", Time> {
  private _paneViews: PriceAlertPaneView[];
  private _priceAxisViews: PriceAlertPriceAxisView[];
  private _timeAxisViews: PriceAlertTimeAxisView[];
  private _targetPrice: number;
  private _triggerTime: number;
  private _color: string;
  private _series: unknown = null;
  private _chart: unknown = null;

  constructor(targetPrice: number, triggerTime: number, color = "#9C27B0") {
    this._targetPrice = targetPrice;
    this._triggerTime = triggerTime;
    this._color = color;
    this._paneViews = [new PriceAlertPaneView(this)];
    this._priceAxisViews = [new PriceAlertPriceAxisView(this)];
    this._timeAxisViews = [new PriceAlertTimeAxisView(this)];
  }

  updateAllViews() {
    this._paneViews.forEach((pw) => pw.update());
  }

  paneViews() {
    return this._paneViews;
  }

  priceAxisViews() {
    return this._priceAxisViews;
  }

  timeAxisViews() {
    return this._timeAxisViews;
  }

  getTargetPrice() {
    return this._targetPrice;
  }

  getTriggerTime() {
    return this._triggerTime;
  }

  getColor() {
    return this._color;
  }

  attached(param: SeriesAttachedParameter<Time, "Line">) {
    this._chart = param.chart;
    this._series = param.series;
  }

  detached() {
    this._chart = null;
    this._series = null;
  }

  getChart() {
    return this._chart;
  }

  getSeries() {
    return this._series;
  }
}

class PriceAlertPaneView implements IPrimitivePaneView {
  private _source: PriceAlertPrimitive;
  private _renderer: PriceAlertPaneRenderer;

  constructor(source: PriceAlertPrimitive) {
    this._source = source;
    this._renderer = new PriceAlertPaneRenderer();
  }

  update() {
    const chart = this._source.getChart() as {
      timeScale: () => { timeToCoordinate: (time: number) => number | null };
    };
    const series = this._source.getSeries() as {
      priceToCoordinate: (price: number) => number | null;
    };
    if (!chart || !series) return;

    const timeScale = chart.timeScale();
    const x = timeScale.timeToCoordinate(this._source.getTriggerTime());
    const y = series.priceToCoordinate(this._source.getTargetPrice());

    if (x === null || y === null) return;

    this._renderer.setData({
      x,
      y,
      color: this._source.getColor(),
      price: this._source.getTargetPrice(),
    });
  }

  renderer() {
    return this._renderer;
  }

  zOrder() {
    return "top" as const;
  }
}

class PriceAlertPaneRenderer implements IPrimitivePaneRenderer {
  private _data: { x: number; y: number; color: string; price: number } | null = null;

  setData(data: { x: number; y: number; color: string; price: number } | null) {
    this._data = data;
  }

  draw(target: {
    useBitmapCoordinateSpace: (
      callback: (scope: { context: CanvasRenderingContext2D }) => void,
    ) => void;
  }) {
    if (!this._data) return;

    target.useBitmapCoordinateSpace((scope: { context: CanvasRenderingContext2D }) => {
      const ctx = scope.context;
      const radius = 8;

      // Draw alert circle
      ctx.fillStyle = this._data!.color;
      ctx.beginPath();
      ctx.arc(this._data!.x, this._data!.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw exclamation mark
      ctx.fillStyle = "white";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("!", this._data!.x, this._data!.y);
    });
  }
}

class PriceAlertPriceAxisView implements ISeriesPrimitiveAxisView {
  private _source: PriceAlertPrimitive;

  constructor(source: PriceAlertPrimitive) {
    this._source = source;
  }

  coordinate() {
    const series = this._source.getSeries() as {
      priceToCoordinate: (price: number) => number | null;
    };
    if (!series) return -1000;
    const coord = series.priceToCoordinate(this._source.getTargetPrice());
    return coord ?? -1000;
  }

  text() {
    return `Alert: ${this._source.getTargetPrice().toFixed(2)}`;
  }

  textColor() {
    return "white";
  }

  backColor() {
    return this._source.getColor();
  }

  visible() {
    return true;
  }
}

class PriceAlertTimeAxisView implements ISeriesPrimitiveAxisView {
  private _source: PriceAlertPrimitive;

  constructor(source: PriceAlertPrimitive) {
    this._source = source;
  }

  coordinate() {
    const chart = this._source.getChart() as {
      timeScale: () => { timeToCoordinate: (time: number) => number | null };
    };
    if (!chart) return -1000;
    const coord = chart.timeScale().timeToCoordinate(this._source.getTriggerTime());
    return coord ?? -1000;
  }

  text() {
    const date = new Date(this._source.getTriggerTime() * 1000);
    return date.toLocaleTimeString();
  }

  textColor() {
    return "white";
  }

  backColor() {
    return this._source.getColor();
  }

  visible() {
    return true;
  }
}

// Annotation/Text Primitive
class TextAnnotationPrimitive implements SeriesPrimitive<"Line", Time> {
  private _paneViews: TextAnnotationPaneView[];
  private _time: number;
  private _price: number;
  private _text: string;
  private _color: string;
  private _series: unknown = null;
  private _chart: unknown = null;

  constructor(time: number, price: number, text: string, color = "#FF9800") {
    this._time = time;
    this._price = price;
    this._text = text;
    this._color = color;
    this._paneViews = [new TextAnnotationPaneView(this)];
  }

  updateAllViews() {
    this._paneViews.forEach((pw) => pw.update());
  }

  paneViews() {
    return this._paneViews;
  }

  getTime() {
    return this._time;
  }

  getPrice() {
    return this._price;
  }

  getText() {
    return this._text;
  }

  getColor() {
    return this._color;
  }

  attached(param: SeriesAttachedParameter<Time, "Line">) {
    this._chart = param.chart;
    this._series = param.series;
  }

  detached() {
    this._chart = null;
    this._series = null;
  }

  getChart() {
    return this._chart;
  }

  getSeries() {
    return this._series;
  }
}

class TextAnnotationPaneView implements IPrimitivePaneView {
  private _source: TextAnnotationPrimitive;
  private _renderer: TextAnnotationPaneRenderer;

  constructor(source: TextAnnotationPrimitive) {
    this._source = source;
    this._renderer = new TextAnnotationPaneRenderer();
  }

  update() {
    const chart = this._source.getChart() as {
      timeScale: () => { timeToCoordinate: (time: number) => number | null };
    };
    const series = this._source.getSeries() as {
      priceToCoordinate: (price: number) => number | null;
    };
    if (!chart || !series) return;

    const timeScale = chart.timeScale();
    const x = timeScale.timeToCoordinate(this._source.getTime());
    const y = series.priceToCoordinate(this._source.getPrice());

    if (x === null || y === null) return;

    this._renderer.setData({
      x,
      y,
      text: this._source.getText(),
      color: this._source.getColor(),
    });
  }

  renderer() {
    return this._renderer;
  }

  zOrder() {
    return "top" as const;
  }
}

class TextAnnotationPaneRenderer implements IPrimitivePaneRenderer {
  private _data: { x: number; y: number; text: string; color: string } | null = null;

  setData(data: { x: number; y: number; text: string; color: string } | null) {
    this._data = data;
  }

  draw(target: {
    useBitmapCoordinateSpace: (
      callback: (scope: { context: CanvasRenderingContext2D }) => void,
    ) => void;
  }) {
    if (!this._data) return;

    target.useBitmapCoordinateSpace((scope: { context: CanvasRenderingContext2D }) => {
      const ctx = scope.context;
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      // Measure text for background
      const textMetrics = ctx.measureText(this._data!.text);
      const textWidth = textMetrics.width;
      const textHeight = 14;
      const padding = 4;

      // Draw background
      ctx.fillStyle = this._data!.color;
      ctx.fillRect(
        this._data!.x - textWidth / 2 - padding,
        this._data!.y - textHeight - padding * 2,
        textWidth + padding * 2,
        textHeight + padding * 2,
      );

      // Draw text
      ctx.fillStyle = "white";
      ctx.fillText(this._data!.text, this._data!.x, this._data!.y - padding);
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

export const SeriesPrimitivesExample = () => {
  const navigate = useNavigate();
  const [selectedPrimitive, setSelectedPrimitive] = createSignal<string>("all");

  // Generate sample data
  const timestamps = generateDateSequence("2024-01-01", 300);
  const lineData = generateLineData(timestamps);

  // Create primitive instances - ensure we have valid timestamps
  const validTime1 = timestamps[50] ?? timestamps[0] ?? 1;
  const validTime2 = timestamps[250] ?? timestamps[timestamps.length - 1] ?? 2;
  const validTime3 = timestamps[200] ?? timestamps[0] ?? 1;
  const validTime4 = timestamps[150] ?? timestamps[0] ?? 1;

  const trendLine = new TrendLinePrimitive(
    { time: validTime1, price: 105 },
    { time: validTime2, price: 115 },
    "#2962FF",
  );

  const supportLevel = new SupportResistancePrimitive(102, "Support", "#4CAF50");
  const resistanceLevel = new SupportResistancePrimitive(118, "Resistance", "#F44336");

  const priceAlert = new PriceAlertPrimitive(112, validTime3, "#9C27B0");

  const textAnnotation = new TextAnnotationPrimitive(validTime4, 110, "Key Level", "#FF9800");

  const getPrimitivesForSelection = () => {
    switch (selectedPrimitive()) {
      case "trendline":
        return [trendLine];
      case "levels":
        return [supportLevel, resistanceLevel];
      case "alerts":
        return [priceAlert];
      case "annotations":
        return [textAnnotation];
      case "all":
      default:
        return [trendLine, supportLevel, resistanceLevel, priceAlert, textAnnotation];
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
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Series Primitives Example</h1>
        <p class="text-gray-600 mb-4">
          Demonstrates how to create and use series primitives for custom visualizations. Primitives
          allow you to draw custom graphics on the chart using the Canvas 2D API.
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
            onClick={() => setSelectedPrimitive("trendline")}
            class={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPrimitive() === "trendline"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Trend Line
          </button>
          <button
            onClick={() => setSelectedPrimitive("levels")}
            class={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPrimitive() === "levels"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Support/Resistance
          </button>
          <button
            onClick={() => setSelectedPrimitive("alerts")}
            class={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPrimitive() === "alerts"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Price Alerts
          </button>
          <button
            onClick={() => setSelectedPrimitive("annotations")}
            class={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedPrimitive() === "annotations"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Text Annotations
          </button>
        </div>
      </div>

      <div class="grid gap-6">
        {/* Interactive Chart */}
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">Interactive Chart with Series Primitives</h2>
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
            <TimeChart.Series
              type="Line"
              data={lineData}
              color="#26A69A"
              lineWidth={2}
              primitives={getPrimitivesForSelection()}
            />
          </TimeChart>
        </div>

        {/* Documentation */}
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">Primitive Types & Features</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium mb-3 text-blue-600">Trend Line Primitive</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Draws lines between two price/time points</li>
                <li>• Shows price axis label at end point</li>
                <li>• Implements ISeriesPrimitive interface</li>
                <li>• Uses paneViews for main drawing</li>
                <li>• Uses priceAxisViews for axis labels</li>
              </ul>

              <h3 class="text-lg font-medium mb-3 mt-6 text-green-600">Support/Resistance</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Horizontal lines across visible time range</li>
                <li>• Dashed line style for visual distinction</li>
                <li>• Dynamic text labels on the chart</li>
                <li>• Price axis integration</li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-3 text-purple-600">Price Alerts</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Point-based alerts at specific time/price</li>
                <li>• Custom shapes (circles with icons)</li>
                <li>• Both price and time axis labels</li>
                <li>• Top z-order for visibility</li>
              </ul>

              <h3 class="text-lg font-medium mb-3 mt-6 text-orange-600">Text Annotations</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Arbitrary text at specific coordinates</li>
                <li>• Background rectangles for readability</li>
                <li>• Font and color customization</li>
                <li>• Text measurement for proper sizing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Code Structure */}
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">Primitive Implementation Structure</h2>
          <div class="bg-gray-50 p-4 rounded-lg">
            <pre class="text-sm text-gray-800 overflow-x-auto">
              <code>{`// Basic Primitive Structure
class MyPrimitive {
  constructor(options) {
    this._paneViews = [new MyPaneView(this)];
    this._priceAxisViews = [new MyPriceAxisView(this)];
    // Store options and state
  }

  // Required methods
  updateAllViews() {
    this._paneViews.forEach(pw => pw.update());
  }

  paneViews() { return this._paneViews; }
  priceAxisViews() { return this._priceAxisViews; }
  timeAxisViews() { return this._timeAxisViews; } // optional

  // Lifecycle methods
  attached(param) {
    this._chart = param.chart;
    this._series = param.series;
  }

  detached() {
    // Cleanup
  }
}

// View classes handle coordinate conversion
class MyPaneView {
  update() {
    // Convert time/price to screen coordinates
    const x = timeScale.timeToCoordinate(time);
    const y = series.priceToCoordinate(price);
    this._renderer.setData({ x, y, ... });
  }

  renderer() { return this._renderer; }
  zOrder() { return 'normal'; } // 'bottom', 'normal', 'top'
}

// Renderer classes do the actual drawing
class MyPaneRenderer {
  draw(target) {
    target.useBitmapCoordinateSpace(scope => {
      const ctx = scope.context;
      // Use Canvas 2D API to draw
    });
  }
}`}</code>
            </pre>
          </div>
        </div>

        {/* Usage Guide */}
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">How to Use Primitives</h2>
          <div class="space-y-4">
            <div>
              <h3 class="font-medium text-gray-900 mb-2">1. Create Primitive Instance</h3>
              <div class="bg-gray-50 p-3 rounded">
                <code class="text-sm">
                  const trendLine = new TrendLinePrimitive(p1, p2, color);
                </code>
              </div>
            </div>

            <div>
              <h3 class="font-medium text-gray-900 mb-2">2. Attach to Series</h3>
              <div class="bg-gray-50 p-3 rounded">
                <code class="text-sm">{"<TimeChart.Series primitives={[trendLine]} ... />"}</code>
              </div>
            </div>

            <div>
              <h3 class="font-medium text-gray-900 mb-2">3. Key Concepts</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>
                  • <strong>Views:</strong> Handle coordinate conversion and state management
                </li>
                <li>
                  • <strong>Renderers:</strong> Perform actual Canvas 2D drawing operations
                </li>
                <li>
                  • <strong>zOrder:</strong> Controls layering ('bottom', 'normal', 'top')
                </li>
                <li>
                  • <strong>Coordinate conversion:</strong> timeToCoordinate(), priceToCoordinate()
                </li>
                <li>
                  • <strong>Lifecycle:</strong> attached() and detached() for setup/cleanup
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
