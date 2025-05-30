import { useNavigate } from "@solidjs/router";
import { type CandlestickData, type LineData, type Time } from "lightweight-charts";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  untrack,
} from "solid-js";

import { TimeChart } from "../../src";

// Performance monitoring utilities
class PerformanceMonitor {
  private memoryEntries: Array<{ timestamp: number; usage: number }> = [];
  private seriesCount = 0;
  private dataPointCount = 0;

  recordMemoryUsage() {
    if ("memory" in performance) {
      const usage = (performance as PerformanceWithMemory).memory.usedJSHeapSize / (1024 * 1024); // MB
      this.memoryEntries.push({
        timestamp: Date.now(),
        usage,
      });

      // Keep only last 50 entries
      if (this.memoryEntries.length > 50) {
        this.memoryEntries = this.memoryEntries.slice(-50);
      }
    }
  }

  setSeriesCount(count: number) {
    this.seriesCount = count;
  }

  setDataPointCount(count: number) {
    this.dataPointCount = count;
  }

  getStats() {
    const latest = this.memoryEntries[this.memoryEntries.length - 1];
    const oldest = this.memoryEntries[0];
    const memoryChange = latest && oldest ? latest.usage - oldest.usage : 0;

    return {
      currentMemory: latest?.usage.toFixed(2) || "N/A",
      memoryChange: memoryChange.toFixed(2),
      seriesCount: this.seriesCount,
      dataPointCount: this.dataPointCount,
      memoryHistory: this.memoryEntries,
    };
  }
}

// Add interface at the top after imports
interface PerformanceWithMemory extends Performance {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

type DataPoint = CandlestickData<Time> | LineData<Time>;
type Dataset = {
  id: string;
  data: DataPoint[];
  type: string;
  color: string;
};

// Data generation with configurable performance characteristics
function generateLargeDataset(count: number, startTime?: number) {
  const now = startTime || Date.now();
  const data = [];

  for (let i = 0; i < count; i++) {
    const time = Math.floor((now - (count - i) * 60000) / 1000) as Time;
    const value = 100 + Math.sin(i / 100) * 50 + Math.random() * 20 - 10;
    data.push({ time, value });
  }

  return data;
}

function generateCandleDataset(count: number, startTime?: number) {
  const now = startTime || Date.now();
  const data = [];
  let price = 100;

  for (let i = 0; i < count; i++) {
    const time = Math.floor((now - (count - i) * 60000) / 1000) as Time;
    const change = (Math.random() - 0.5) * 4;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;

    data.push({ time, open, high, low, close });
    price = close;
  }

  return data;
}

export const PerformanceExample = () => {
  const navigate = useNavigate();

  // Performance monitoring
  const [monitor] = createSignal(new PerformanceMonitor());
  const [stats, setStats] = createSignal(untrack(monitor).getStats());

  // Configuration
  const [dataSize, setDataSize] = createSignal(1000);
  const [seriesCount, setSeriesCount] = createSignal(3);
  const [updateFrequency, setUpdateFrequency] = createSignal(1000);
  const [isStressTest, setIsStressTest] = createSignal(false);

  // Data state
  const [datasets, setDatasets] = createSignal<Dataset[]>([]);

  // Performance monitoring interval
  let monitoringInterval: ReturnType<typeof setInterval> | null = null;
  let stressInterval: ReturnType<typeof setInterval> | null = null;

  const generateInitialData = () => {
    const newDatasets = [];
    const count = Math.min(dataSize(), 10000); // Cap at 10k for safety

    // Primary candlestick series
    newDatasets.push({
      id: "main",
      data: generateCandleDataset(count),
      type: "Candlestick",
      color: "#26a69a",
    });

    // Additional line series
    for (let i = 1; i < seriesCount(); i++) {
      newDatasets.push({
        id: `line-${i}`,
        data: generateLargeDataset(count),
        type: "Line",
        color: `hsl(${(i * 360) / seriesCount()}, 70%, 50%)`,
      });
    }

    setDatasets(newDatasets);
    monitor().setSeriesCount(newDatasets.length);
    monitor().setDataPointCount(newDatasets.reduce((sum, ds) => sum + ds.data.length, 0));
  };

  const startStressTest = () => {
    if (stressInterval) return;

    stressInterval = setInterval(() => {
      // Add new data points to all series
      setDatasets((prev) =>
        prev.map((dataset) => {
          const newTime = Math.floor(Date.now() / 1000) as Time;

          if (dataset.type === "Candlestick") {
            const lastCandle = dataset.data[dataset.data.length - 1] as CandlestickData<Time>;
            const newPrice = lastCandle ? lastCandle.close + (Math.random() - 0.5) * 2 : 100;
            const newCandle: CandlestickData<Time> = {
              time: newTime,
              open: lastCandle?.close || 100,
              high: newPrice + Math.random() * 2,
              low: newPrice - Math.random() * 2,
              close: newPrice,
            };

            return {
              ...dataset,
              data: [...dataset.data.slice(-dataSize() + 1), newCandle],
            };
          } else {
            const lastPoint = dataset.data[dataset.data.length - 1] as LineData<Time>;
            const newValue = lastPoint ? lastPoint.value + (Math.random() - 0.5) * 5 : 100;
            const newPoint: LineData<Time> = { time: newTime, value: newValue };

            return {
              ...dataset,
              data: [...dataset.data.slice(-dataSize() + 1), newPoint],
            };
          }
        }),
      );
    }, updateFrequency());
  };

  const stopStressTest = () => {
    if (stressInterval) {
      clearInterval(stressInterval);
      stressInterval = null;
    }
  };

  // Memory monitoring
  createEffect(() => {
    if (!monitoringInterval) {
      monitoringInterval = setInterval(() => {
        monitor().recordMemoryUsage();
        setStats(monitor().getStats());
      }, 500);
    }
  });

  // Stress test control
  createEffect(() => {
    if (isStressTest()) {
      startStressTest();
    } else {
      stopStressTest();
    }
  });

  onCleanup(() => {
    if (monitoringInterval) clearInterval(monitoringInterval);
    if (stressInterval) clearInterval(stressInterval);
  });

  // Generate initial data on mount
  onMount(() => {
    generateInitialData();
  });

  // Memoized performance indicators
  const performanceStatus = createMemo(() => {
    const current = parseFloat(stats().currentMemory as string);
    const change = parseFloat(stats().memoryChange);

    if (isNaN(current)) return { status: "unknown", color: "gray" };

    if (current > 100) return { status: "high", color: "red" };
    if (change > 10) return { status: "increasing", color: "orange" };
    if (change < -5) return { status: "stable", color: "green" };
    return { status: "normal", color: "blue" };
  });

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
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Performance & Memory Management</h1>
        <p class="text-gray-600">
          Monitor chart performance, memory usage, and test lifecycle management with large
          datasets.
        </p>
      </div>

      {/* Performance Stats */}
      <div class="grid md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-500">Memory Usage</div>
          <div class={`text-2xl font-bold text-${performanceStatus().color}-600`}>
            {stats().currentMemory} MB
          </div>
          <div class="text-xs text-gray-400">Change: {stats().memoryChange} MB</div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-500">Active Series</div>
          <div class="text-2xl font-bold text-blue-600">{stats().seriesCount}</div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-500">Total Data Points</div>
          <div class="text-2xl font-bold text-green-600">
            {stats().dataPointCount.toLocaleString()}
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-500">Performance</div>
          <div class={`text-lg font-semibold text-${performanceStatus().color}-600 capitalize`}>
            {performanceStatus().status}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 class="text-xl font-semibold mb-4">Performance Test Controls</h2>

        <div class="grid md:grid-cols-3 gap-4 mb-4">
          <div class="flex flex-col space-y-1">
            <label class="text-sm font-medium">Data Points per Series</label>
            <input
              type="number"
              value={dataSize()}
              onChange={(e) => setDataSize(parseInt(e.target.value) || 1000)}
              min="100"
              max="10000"
              step="100"
              class="border rounded px-2 py-1 text-sm"
            />
            <div class="text-xs text-gray-500">Max: 10,000 for safety</div>
          </div>

          <div class="flex flex-col space-y-1">
            <label class="text-sm font-medium">Number of Series</label>
            <input
              type="number"
              value={seriesCount()}
              onChange={(e) => setSeriesCount(Math.max(1, parseInt(e.target.value) || 3))}
              min="1"
              max="20"
              class="border rounded px-2 py-1 text-sm"
            />
            <div class="text-xs text-gray-500">1-20 series</div>
          </div>

          <div class="flex flex-col space-y-1">
            <label class="text-sm font-medium">Update Frequency (ms)</label>
            <input
              type="number"
              value={updateFrequency()}
              onChange={(e) => setUpdateFrequency(parseInt(e.target.value) || 1000)}
              min="100"
              max="5000"
              step="100"
              class="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-4">
          <button
            onClick={generateInitialData}
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate New Dataset
          </button>

          <button
            onClick={() => setIsStressTest(!isStressTest())}
            class={`px-4 py-2 rounded ${
              isStressTest()
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isStressTest() ? "Stop Stress Test" : "Start Stress Test"}
          </button>

          <button
            onClick={() => setDatasets([])}
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Chart */}
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">
          Performance Test Chart
          <span class="text-sm font-normal text-gray-500 ml-2">
            ({datasets().length} series,{" "}
            {datasets()
              .reduce((sum, ds) => sum + ds.data.length, 0)
              .toLocaleString()}{" "}
            points)
          </span>
        </h2>

        <Show
          when={datasets().length > 0}
          fallback={
            <div class="h-[500px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div class="text-center">
                <div class="text-gray-400 text-lg mb-2">No data loaded</div>
                <button
                  onClick={generateInitialData}
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Generate Initial Dataset
                </button>
              </div>
            </div>
          }
        >
          <TimeChart
            class="h-[500px] w-full"
            onCreateChart={(_chart) => {
              console.log("📊 Chart created");
            }}
          >
            <For each={datasets()}>
              {(dataset, _index) => (
                <Show when={dataset.type === "Candlestick"}>
                  <TimeChart.Series
                    type="Candlestick"
                    data={dataset.data}
                    upColor="#26a69a"
                    downColor="#ef5350"
                    onCreateSeries={(_series) => {
                      console.log(`✅ Created ${dataset.type} series ${dataset.id}`);
                    }}
                    onRemoveSeries={(_series) => {
                      console.log(`🗑️ Removed ${dataset.type} series ${dataset.id}`);
                    }}
                  />
                </Show>
              )}
            </For>

            <For each={datasets().filter((ds) => ds.type === "Line")}>
              {(dataset) => (
                <TimeChart.Series
                  type="Line"
                  data={dataset.data}
                  color={dataset.color}
                  lineWidth={1}
                  onCreateSeries={(_series) => {
                    console.log(`✅ Created ${dataset.type} series ${dataset.id}`);
                  }}
                  onRemoveSeries={(_series) => {
                    console.log(`🗑️ Removed ${dataset.type} series ${dataset.id}`);
                  }}
                />
              )}
            </For>
          </TimeChart>
        </Show>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium mb-2">Performance Best Practices Demonstrated</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Memory Monitoring:</strong> Real-time JavaScript heap usage tracking
            </li>
            <li>
              • <strong>Data Point Limits:</strong> Configurable data size with safety caps
            </li>
            <li>
              • <strong>Efficient Updates:</strong> Sliding window approach for real-time data
            </li>
            <li>
              • <strong>Series Lifecycle:</strong> Proper cleanup when removing series
            </li>
            <li>
              • <strong>Performance Indicators:</strong> Visual memory usage status
            </li>
            <li>
              • <strong>Stress Testing:</strong> Simulate high-frequency updates
            </li>
          </ul>

          <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div class="font-medium text-yellow-800">💡 Pro Tips:</div>
            <ul class="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• Keep data series under 5,000 points for optimal performance</li>
              <li>• Use sliding windows for real-time data to prevent memory leaks</li>
              <li>• Monitor memory usage when adding/removing series frequently</li>
              <li>• Consider data compression for historical data storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
