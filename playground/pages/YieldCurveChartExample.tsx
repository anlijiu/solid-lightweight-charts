import { useNavigate } from "@solidjs/router";
import { createSeriesMarkers, type SeriesMarker } from "lightweight-charts";

import { YieldCurveChart } from "../../src";

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

export const YieldCurveChartExample = () => {
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
        <h1 class="text-3xl font-bold text-gray-900 mb-2">YieldCurveChart Example</h1>
        <p class="text-gray-600">
          YieldCurveChart is specialized for yield curve analysis with duration-based X-axis.
          Perfect for interest rate curves, term structure analysis, and maturity-based data.
        </p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">YieldCurveChart with Multiple Panes & Markers</h2>
        <YieldCurveChart
          class="h-[500px] w-full"
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
          {/* Main pane: Line */}
          <YieldCurveChart.Series
            type="Line"
            data={generateNumericLineData()}
            lineWidth={2}
            color="#0369a1"
            onSetData={({ series, data }) => {
              // Add markers with createSeriesMarkers API
              const markers = [
                {
                  time: data[50]?.time, // Around -450 index
                  position: "aboveBar",
                  color: "#E91E63",
                  shape: "circle",
                  text: "Point A",
                },
                {
                  time: data[200]?.time, // Around -300 index
                  position: "aboveBar",
                  color: "#E91E63",
                  shape: "circle",
                  text: "Point B",
                },
                {
                  time: data[400]?.time, // Around -100 index
                  position: "aboveBar",
                  color: "#E91E63",
                  shape: "circle",
                  text: "Point C",
                },
                {
                  time: data[600]?.time, // Around 100 index
                  position: "aboveBar",
                  color: "#E91E63",
                  shape: "circle",
                  text: "Point D",
                },
                {
                  time: data[700]?.time, // Around 200 index
                  position: "aboveBar",
                  color: "#E91E63",
                  shape: "circle",
                  text: "Point E",
                },
              ].filter((marker) => marker.time !== undefined) as SeriesMarker<number>[];

              createSeriesMarkers(series, markers);
            }}
          />

          {/* Secondary pane: Area */}
          <YieldCurveChart.Pane>
            <YieldCurveChart.Series
              type="Area"
              data={generateNumericAreaData()}
              lineColor="#0e7490"
              topColor="rgba(14, 116, 144, 0.4)"
              bottomColor="rgba(14, 116, 144, 0)"
              priceScaleId="area"
            />
          </YieldCurveChart.Pane>
        </YieldCurveChart>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium mb-2">Features Demonstrated</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Duration-Based X-Axis:</strong> Specialized for maturity/duration data
            </li>
            <li>
              • <strong>Yield Curve Line:</strong> Primary curve with interest rate styling
            </li>
            <li>
              • <strong>Secondary Pane:</strong> Additional area chart for comparison
            </li>
            <li>
              • <strong>Curve Markers:</strong> Key points along the yield curve
            </li>
            <li>
              • <strong>Specialized Grid:</strong> Optimized for yield curve visualization
            </li>
            <li>
              • <strong>No Whitespace Gaps:</strong> Continuous curve rendering
            </li>
          </ul>
        </div>

        <div class="mt-4 p-4 bg-green-50 rounded-lg">
          <h4 class="text-md font-medium mb-2 text-green-900">Use Cases</h4>
          <ul class="text-sm text-green-700 space-y-1">
            <li>• Government bond yield curves</li>
            <li>• Corporate credit curves</li>
            <li>• Term structure of interest rates</li>
            <li>• Volatility surface cross-sections</li>
            <li>• Duration-based risk analysis</li>
            <li>• Maturity bucketing visualizations</li>
          </ul>
        </div>

        <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 class="text-md font-medium mb-2 text-yellow-900">Key Differences</h4>
          <ul class="text-sm text-yellow-700 space-y-1">
            <li>• X-axis represents duration/maturity instead of time or price</li>
            <li>• Optimized for curve interpolation and smoothing</li>
            <li>• Specialized crosshair behavior for yield analysis</li>
            <li>• Grid lines tailored for financial term structure</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
