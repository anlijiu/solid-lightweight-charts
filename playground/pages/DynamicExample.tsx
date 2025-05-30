import { useNavigate } from "@solidjs/router";
import { type Time } from "lightweight-charts";
import { createEffect, createSignal, For, onCleanup, onMount, Show, untrack } from "solid-js";

import { TimeChart } from "../../src";

// Data generators
function generateRandomData(count: number, baseValue: number = 100) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    time: Math.floor((now - (count - i) * 60000) / 1000) as Time,
    value: baseValue + Math.random() * 20 - 10 + Math.sin(i / 10) * 5,
  }));
}

function generateCandleData(count: number) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const time = Math.floor((now - (count - i) * 60000) / 1000) as Time;
    const open = 100 + Math.random() * 20 - 10;
    const close = open + (Math.random() - 0.5) * 10;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    return { time, open, high, low, close };
  });
}

function generateVolumeData(count: number) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    time: Math.floor((now - (count - i) * 60000) / 1000) as Time,
    value: Math.max(50000 + Math.random() * 100000, 10000),
    color: Math.random() > 0.5 ? "rgba(76, 175, 80, 0.5)" : "rgba(255, 82, 82, 0.5)",
  }));
}

type SeriesConfig = {
  id: string;
  type: "Line" | "Area" | "Candlestick";
  name: string;
  paneIndex?: number;
  color?: string;
  enabled: boolean;
};

export const DynamicExample = () => {
  const navigate = useNavigate();

  // Chart state
  const [isRealTime, setIsRealTime] = createSignal(false);
  const [updateInterval, setUpdateInterval] = createSignal(1000);
  const [dataLength, setDataLength] = createSignal(50);

  // Series configurations
  const [seriesConfigs, setSeriesConfigs] = createSignal<SeriesConfig[]>([
    { id: "main", type: "Candlestick", name: "Price", paneIndex: 0, enabled: true },
    { id: "line1", type: "Line", name: "MA 20", paneIndex: 0, color: "#2196F3", enabled: false },
    { id: "line2", type: "Line", name: "MA 50", paneIndex: 0, color: "#FF9800", enabled: false },
    { id: "volume", type: "Area", name: "Volume", paneIndex: 1, color: "#9C27B0", enabled: false },
  ]);

  // Data signals
  const [mainData, setMainData] = createSignal(generateCandleData(untrack(dataLength)));
  const [ma20Data, setMa20Data] = createSignal(generateRandomData(untrack(dataLength), 98));
  const [ma50Data, setMa50Data] = createSignal(generateRandomData(untrack(dataLength), 102));
  const [volumeData, setVolumeData] = createSignal(generateVolumeData(untrack(dataLength)));

  // Real-time data simulation
  let intervalId: ReturnType<typeof setInterval> | null = null;

  createEffect(() => {
    if (isRealTime()) {
      intervalId = setInterval(() => {
        const now = Math.floor(Date.now() / 1000) as Time;

        // Update main data
        setMainData((prev) => {
          const lastCandle = prev[prev.length - 1];
          if (!lastCandle) return prev;

          const lastPrice = lastCandle.close;
          const newPrice = lastPrice + (Math.random() - 0.5) * 2;
          const newCandle = {
            time: now,
            open: lastPrice,
            high: Math.max(lastPrice, newPrice) + Math.random(),
            low: Math.min(lastPrice, newPrice) - Math.random(),
            close: newPrice,
          };
          return [...prev.slice(-dataLength() + 1), newCandle];
        });

        // Update indicators
        setMa20Data((prev) => {
          const lastPoint = prev[prev.length - 1];
          if (!lastPoint) return prev;

          const newValue = lastPoint.value + (Math.random() - 0.5) * 1;
          return [...prev.slice(-dataLength() + 1), { time: now, value: newValue }];
        });

        setMa50Data((prev) => {
          const lastPoint = prev[prev.length - 1];
          if (!lastPoint) return prev;

          const newValue = lastPoint.value + (Math.random() - 0.5) * 0.8;
          return [...prev.slice(-dataLength() + 1), { time: now, value: newValue }];
        });

        setVolumeData((prev) => {
          const newVolume = {
            time: now,
            value: Math.max(50000 + Math.random() * 100000, 10000),
            color: Math.random() > 0.5 ? "rgba(76, 175, 80, 0.5)" : "rgba(255, 82, 82, 0.5)",
          };
          return [...prev.slice(-dataLength() + 1), newVolume];
        });
      }, updateInterval());
    } else if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  onCleanup(() => {
    if (intervalId) clearInterval(intervalId);
  });

  // Generate initial data on mount
  onMount(() => {
    regenerateData();
  });

  // Series management functions
  const toggleSeries = (seriesId: string) => {
    setSeriesConfigs((prev) =>
      prev.map((config) =>
        config.id === seriesId ? { ...config, enabled: !config.enabled } : config,
      ),
    );
  };

  const regenerateData = () => {
    setMainData(generateCandleData(dataLength()));
    setMa20Data(generateRandomData(dataLength(), 98));
    setMa50Data(generateRandomData(dataLength(), 102));
    setVolumeData(generateVolumeData(dataLength()));
  };

  const getSeriesData = (seriesId: string) => {
    switch (seriesId) {
      case "main":
        return mainData();
      case "line1":
        return ma20Data();
      case "line2":
        return ma50Data();
      case "volume":
        return volumeData();
      default:
        return [];
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
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dynamic Chart Management</h1>
        <p class="text-gray-600">
          Interactive example demonstrating real-time updates, series lifecycle management, and
          dynamic chart manipulation with proper cleanup.
        </p>
      </div>

      {/* Controls */}
      <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 class="text-xl font-semibold mb-4">Chart Controls</h2>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Real-time toggle */}
          <div class="flex items-center space-x-2">
            <input
              id="realtime"
              type="checkbox"
              checked={isRealTime()}
              onChange={(e) => setIsRealTime(e.target.checked)}
              class="rounded"
            />
            <label for="realtime" class="text-sm font-medium">
              Real-time Updates
            </label>
          </div>

          {/* Update interval */}
          <div class="flex flex-col space-y-1">
            <label class="text-sm font-medium">Update Interval (ms)</label>
            <input
              type="number"
              value={updateInterval()}
              onChange={(e) => setUpdateInterval(parseInt(e.target.value) || 1000)}
              min="100"
              max="5000"
              step="100"
              class="border rounded px-2 py-1 text-sm"
            />
          </div>

          {/* Data length */}
          <div class="flex flex-col space-y-1">
            <label class="text-sm font-medium">Data Points</label>
            <input
              type="number"
              value={dataLength()}
              onChange={(e) => setDataLength(parseInt(e.target.value) || 50)}
              min="10"
              max="200"
              step="10"
              class="border rounded px-2 py-1 text-sm"
            />
          </div>

          {/* Regenerate button */}
          <div class="flex items-end">
            <button
              onClick={regenerateData}
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Regenerate Data
            </button>
          </div>
        </div>

        {/* Series toggles */}
        <div class="border-t pt-4">
          <h3 class="text-lg font-medium mb-3">Series Management</h3>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <For each={seriesConfigs()}>
              {(config) => (
                <div class="flex items-center space-x-2">
                  <input
                    id={config.id}
                    type="checkbox"
                    checked={config.enabled}
                    onChange={() => toggleSeries(config.id)}
                    class="rounded"
                  />
                  <label for={config.id} class="text-sm font-medium">
                    {config.name}
                    {config.paneIndex !== 0 && ` (Pane ${config.paneIndex})`}
                  </label>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">
          Dynamic Chart
          <span class="text-sm font-normal text-gray-500 ml-2">
            (Active Series: {seriesConfigs().filter((s) => s.enabled).length})
          </span>
        </h2>

        <TimeChart
          class="h-[600px] w-full"
          timeScale={{
            timeVisible: true,
            secondsVisible: false,
            barSpacing: 6,
            minBarSpacing: 2,
          }}
          rightPriceScale={{
            visible: true,
            scaleMargins: { top: 0.1, bottom: 0.2 },
          }}
          leftPriceScale={{ visible: false }}
        >
          {/* Main chart series */}
          <For each={seriesConfigs().filter((config) => config.enabled && config.paneIndex === 0)}>
            {(config) => (
              <Show when={config.type === "Candlestick"}>
                <TimeChart.Series
                  type="Candlestick"
                  data={getSeriesData(config.id)}
                  upColor="#26a69a"
                  downColor="#ef5350"
                  markers={(data) => {
                    // Add some markers for demonstration
                    if (data.length > 10) {
                      const targetData = data[Math.floor(data.length * 0.7)];
                      if (targetData && "close" in targetData) {
                        return [
                          {
                            time: targetData.time,
                            position: "aboveBar",
                            color: "#f68410",
                            shape: "circle",
                            text: "Signal",
                            price: targetData.close,
                          },
                        ];
                      }
                    }
                    return [];
                  }}
                  onCreateSeries={(_series) => {
                    console.log(`✅ Created ${config.name} series`);
                  }}
                  onRemoveSeries={() => {
                    console.log(`🗑️ Removed ${config.name} series`);
                  }}
                />
              </Show>
            )}
          </For>

          <For
            each={seriesConfigs().filter(
              (config) => config.enabled && config.paneIndex === 0 && config.type === "Line",
            )}
          >
            {(config) => (
              <TimeChart.Series
                type="Line"
                data={getSeriesData(config.id)}
                color={config.color}
                lineWidth={2}
                onCreateSeries={(_series) => {
                  console.log(`✅ Created ${config.name} series`);
                }}
                onRemoveSeries={() => {
                  console.log(`🗑️ Removed ${config.name} series`);
                }}
              />
            )}
          </For>

          {/* Volume pane - only show if volume series is enabled */}
          <Show when={seriesConfigs().some((config) => config.enabled && config.paneIndex === 1)}>
            <TimeChart.Pane>
              <For
                each={seriesConfigs().filter((config) => config.enabled && config.paneIndex === 1)}
              >
                {(config) => (
                  <TimeChart.Series
                    type="Area"
                    data={getSeriesData(config.id)}
                    lineColor={config.color}
                    topColor={`${config.color}40`}
                    bottomColor={`${config.color}00`}
                    priceScaleId="volume"
                    priceFormat={{ type: "volume" }}
                    onCreateSeries={(_series) => {
                      console.log(`✅ Created ${config.name} series`);
                    }}
                    onRemoveSeries={(_series) => {
                      console.log(`🗑️ Removed ${config.name} series`);
                    }}
                  />
                )}
              </For>
            </TimeChart.Pane>
          </Show>
        </TimeChart>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium mb-2">Features Demonstrated</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Dynamic Series Management:</strong> Add/remove series with proper cleanup
            </li>
            <li>
              • <strong>Real-time Updates:</strong> Simulated live data with configurable intervals
            </li>
            <li>
              • <strong>Pane Lifecycle:</strong> Automatic pane creation/removal based on series
              presence
            </li>
            <li>
              • <strong>Reactive Data:</strong> SolidJS signals driving chart updates
            </li>
            <li>
              • <strong>Series Tracking:</strong> Monitor active series with console logging
            </li>
            <li>
              • <strong>Interactive Controls:</strong> Toggle features and adjust parameters live
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
