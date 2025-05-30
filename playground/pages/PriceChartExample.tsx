import { useNavigate } from "@solidjs/router";
import { createSeriesMarkers, type SeriesMarker } from "lightweight-charts";

import { PriceChart } from "../../src";

// Line data for numeric-based charts
function generateNumericLineData() {
  // Start from -500 to fill the left side of the chart even more
  return Array.from({ length: 750 }, (_, i) => ({
    time: i - 500,
    value: 100 + Math.sin((i - 500) / 10) * 20 + Math.random() * 15,
  }));
}

// Area data for numeric-based charts
function generateNumericAreaData() {
  // Start from -500 to fill the left side of the chart even more
  return Array.from({ length: 750 }, (_, i) => ({
    time: i - 500,
    value: 90 + Math.cos((i - 500) / 12) * 15 + Math.random() * 10,
  }));
}

// Histogram data for numeric-based charts
function generateNumericHistogramData() {
  // Start from -500 to fill the left side of the chart even more
  return Array.from({ length: 750 }, (_, i) => ({
    time: i - 500,
    value: Math.abs(Math.sin((i - 500) / 20) * 20) + Math.random() * 10,
    color: i % 2 ? "#26a69a" : "#ef5350",
  }));
}

export const PriceChartExample = () => {
  const navigate = useNavigate();

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
        <h1 class="text-3xl font-bold text-gray-900 mb-2">PriceChart Example</h1>
        <p class="text-gray-600">
          PriceChart displays data with numeric-based X-axis instead of time. This is useful for
          price vs. price charts, spread analysis, or any numeric correlation visualization.
        </p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">PriceChart with Multiple Panes & Markers</h2>
        <PriceChart
          class="h-[500px] w-full"
          autoSize={true}
          rightPriceScale={{
            visible: true,
            scaleMargins: { top: 0.1, bottom: 0.1 },
          }}
          leftPriceScale={{ visible: false }}
          timeScale={{
            barSpacing: 1,
            minBarSpacing: 0.2,
            rightOffset: 0,
          }}
          onCreateChart={(chart) => {
            setTimeout(() => {
              // Set specific range to ensure data fills the entire chart width
              chart.timeScale().fitContent();
            }, 50);
          }}
        >
          {/* Main pane: Line + Area */}
          <PriceChart.Series
            type="Line"
            data={generateNumericLineData()}
            lineWidth={2}
            color="#5b21b6"
            onSetData={({ series, data }) => {
              // Add markers with createSeriesMarkers API
              const markers = [
                {
                  time: data[100]?.time, // Around -400 index
                  position: "belowBar",
                  color: "#f68410",
                  shape: "circle",
                  text: "Signal",
                },
                {
                  time: data[250]?.time, // Around -250 index
                  position: "aboveBar",
                  color: "#f68410",
                  shape: "square",
                  text: "Signal",
                },
                {
                  time: data[500]?.time, // Around 0 index
                  position: "belowBar",
                  color: "#f68410",
                  shape: "circle",
                  text: "Signal",
                },
                {
                  time: data[625]?.time, // Around 125 index
                  position: "aboveBar",
                  color: "#f68410",
                  shape: "square",
                  text: "Signal",
                },
                {
                  time: data[700]?.time, // Around 200 index
                  position: "belowBar",
                  color: "#f68410",
                  shape: "circle",
                  text: "Signal",
                },
              ].filter((marker) => marker.time !== undefined) as SeriesMarker<number>[];

              createSeriesMarkers(series, markers);
            }}
          />
          <PriceChart.Series
            type="Area"
            data={generateNumericAreaData()}
            lineColor="#059669"
            topColor="rgba(5, 150, 105, 0.4)"
            bottomColor="rgba(5, 150, 105, 0)"
          />

          {/* Second pane: Histogram */}
          <PriceChart.Pane>
            <PriceChart.Series
              type="Histogram"
              data={generateNumericHistogramData()}
              priceScaleId="histogram"
            />
          </PriceChart.Pane>
        </PriceChart>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium mb-2">Features Demonstrated</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Numeric X-Axis:</strong> Price-based horizontal scale instead of time
            </li>
            <li>
              • <strong>Line Series:</strong> Primary trend line with custom styling
            </li>
            <li>
              • <strong>Area Series:</strong> Overlay area chart with gradient fill
            </li>
            <li>
              • <strong>Histogram Pane:</strong> Separate pane with histogram data
            </li>
            <li>
              • <strong>Series Markers:</strong> Multiple markers across different price points
            </li>
            <li>
              • <strong>AutoSize:</strong> Automatic chart resizing to container
            </li>
            <li>
              • <strong>Fit Content:</strong> Automatic range adjustment to show all data
            </li>
          </ul>
        </div>

        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 class="text-md font-medium mb-2 text-blue-900">Use Cases</h4>
          <ul class="text-sm text-blue-700 space-y-1">
            <li>• Price vs. price correlation charts</li>
            <li>• Spread analysis between different instruments</li>
            <li>• Performance attribution charts</li>
            <li>• Risk/return scatter plots</li>
            <li>• Any non-time-based numeric correlation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
