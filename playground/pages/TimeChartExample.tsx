import { useNavigate } from "@solidjs/router";
import { addDays } from "date-fns";
import {
  createSeriesMarkers,
  type SeriesMarker,
  type SeriesMarkerPosition,
  type SeriesMarkerShape,
  type Time,
} from "lightweight-charts";
import { createMemo } from "solid-js";

import { TimeChart } from "../../src";

// Simple date sequence generator
function generateDateSequence(start: string, count: number) {
  const result = [];
  const [year, month, day] = start.split("-");
  const now = new Date(Number(year), Number(month) - 1, Number(day));

  for (let i = 0; i < count; i++) {
    const date = addDays(now, i);
    const dateString = date.toISOString().split("T")[0]!;
    result.push(dateString);
  }

  return result;
}

// Line data for time-based chart
function generateLineData(dates: string[]) {
  return dates.map((time, i) => ({
    time,
    value: 100 + Math.sin(i / 3) * 5 + i * 0.3 + Math.random() * 10,
  }));
}

// Area data for time-based chart
function generateAreaData(dates: string[]) {
  return dates.map((time, i) => ({
    time,
    value: 90 + Math.cos(i / 4) * 4 + i * 0.2 + Math.random() * 5,
  }));
}

// Candlestick data for time-based chart
function generateCandleData(dates: string[]) {
  return dates.map((time, i) => {
    const open = 100 + Math.sin(i / 5) * 5 + i * 0.2 + Math.random() * 5;
    const close = open + (Math.random() - 0.5) * 10;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    return { time, open, high, low, close };
  });
}

// Volume data for time-based chart
function generateVolumeData(dates: string[]) {
  return dates.map((time, i) => ({
    time,
    value: Math.max(100000 + Math.sin(i / 15) * 50000 + Math.random() * 30000, 20000),
    color: i % 2 ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)",
  }));
}

export const TimeChartExample = () => {
  const navigate = useNavigate();
  const dates = createMemo(() => generateDateSequence("2024-01-01", 580));

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
        <h1 class="text-3xl font-bold text-gray-900 mb-2">TimeChart Example</h1>
        <p class="text-gray-600">
          TimeChart displays time-series data with date-based X-axis. This example shows multiple
          panes with candlestick, line, volume, and area series with interactive markers.
        </p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">TimeChart with Multiple Panes & Markers</h2>
        <TimeChart
          class="h-[500px] w-full"
          timeScale={{
            timeVisible: true,
            secondsVisible: false,
            barSpacing: 6,
            minBarSpacing: 2,
          }}
          rightPriceScale={{
            visible: true,
            scaleMargins: { top: 0.1, bottom: 0.1 },
          }}
          leftPriceScale={{ visible: false }}
          onCreateChart={(chart) => {
            setTimeout(() => {
              // Set a visible range that focuses on the more recent portion of data with markers
              chart.timeScale().setVisibleLogicalRange({
                from: 200,
                to: 500,
              });
            }, 50);
          }}
        >
          {/* Main pane: Candlestick + Line */}
          <TimeChart.Series
            type="Candlestick"
            data={generateCandleData(dates())}
            upColor="#26a69a"
            downColor="#ef5350"
            onSetData={({ series, data }) => {
              // Add markers with createSeriesMarkers API
              const markers = [
                {
                  time: data[250]?.time, // More recent data point
                  position: "aboveBar",
                  color: "#f68410",
                  shape: "circle",
                  text: "Event A",
                },
                {
                  time: data[350]?.time, // More recent data point
                  position: "belowBar",
                  color: "#2196F3",
                  shape: "arrowUp",
                  text: "Buy",
                },
                {
                  time: data[450]?.time, // More recent data point
                  position: "aboveBar",
                  color: "#e91e63",
                  shape: "arrowDown",
                  text: "Sell",
                },
              ] as SeriesMarker<Time>[];

              createSeriesMarkers(series, markers);
            }}
          />
          <TimeChart.Series
            type="Line"
            data={generateLineData(dates())}
            color="rgba(41, 98, 255, 0.7)"
            lineWidth={2}
          />

          {/* Second pane: Volume */}
          <TimeChart.Pane>
            <TimeChart.Series
              type="Histogram"
              data={generateVolumeData(dates())}
              priceFormat={{ type: "volume" }}
              priceScaleId="volume"
            />
            <TimeChart.Series
              type="Line"
              data={generateLineData(dates())}
              color="rgba(41, 98, 255, 0.7)"
              lineWidth={2}
            />
          </TimeChart.Pane>

          {/* Third pane: Area */}
          <TimeChart.Pane>
            <TimeChart.Series
              type="Area"
              data={generateAreaData(dates())}
              lineColor="#FF9800"
              topColor="rgba(255, 152, 0, 0.4)"
              bottomColor="rgba(255, 152, 0, 0)"
              priceScaleId="area"
              onSetData={({ series, data }) => {
                // Create markers at strategic points in the data within visible range
                const markers = [250, 350, 450, 500]
                  .map((i) => data[i])
                  .filter(Boolean)
                  .map((d) => ({
                    time: d!.time,
                    position: "aboveBar" as SeriesMarkerPosition,
                    color: "#9C27B0",
                    shape: "square" as SeriesMarkerShape,
                    text: "Signal",
                  })) as SeriesMarker<Time>[];

                createSeriesMarkers(series, markers);
              }}
            />
          </TimeChart.Pane>
        </TimeChart>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium mb-2">Features Demonstrated</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Candlestick Series:</strong> OHLC data with custom up/down colors
            </li>
            <li>
              • <strong>Line Series:</strong> Overlay trend line on the main pane
            </li>
            <li>
              • <strong>Volume Histogram:</strong> Separate pane with volume data
            </li>
            <li>
              • <strong>Area Series:</strong> Third pane with gradient fill
            </li>
            <li>
              • <strong>Series Markers:</strong> Interactive markers using createSeriesMarkers API
            </li>
            <li>
              • <strong>Multiple Panes:</strong> Vertical stacking with independent Y-axes
            </li>
            <li>
              • <strong>Time Scale:</strong> Date-based X-axis with customizable range
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
