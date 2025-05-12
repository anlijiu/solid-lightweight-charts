import { addDays } from "date-fns";
import {
  createSeriesMarkers,
  type SeriesMarker,
  type SeriesMarkerPosition,
  type SeriesMarkerShape,
  type Time,
} from "lightweight-charts";
import { createMemo } from "solid-js";

import { PriceChart, TimeChart, YieldCurveChart } from "../src";

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

export const App = () => {
  const dates = createMemo(() => generateDateSequence("2024-01-01", 580));

  return (
    <div class="w-screen h-screen flex">
      <div class="grow flex flex-col">
        <div class="text-xl font-bold p-1 bg-slate-100">Solid Lightweight Charts Showcase</div>
        <div class="w-full grow flex flex-col gap-1 p-1">
          {/* TimeChart with multiple panes */}
          <div class="bg-white p-1 rounded shadow">
            <h2 class="text-base font-semibold mb-0">TimeChart with Multiple Panes & Markers</h2>
            <div class="flex flex-col">
              <TimeChart
                class="h-[340px] w-full"
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
                    priceLineVisible={false}
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
            </div>
          </div>

          {/* PriceChart with multiple panes */}
          <div class="bg-white p-1 rounded shadow">
            <h2 class="text-base font-semibold mb-0">PriceChart with Multiple Panes & Markers</h2>
            <PriceChart
              class="h-[310px] w-full"
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
          </div>

          {/* YieldCurveChart with multiple panes */}
          <div class="bg-white p-1 rounded shadow">
            <h2 class="text-base font-semibold mb-0">
              YieldCurveChart with Multiple Panes & Markers
            </h2>
            <YieldCurveChart
              class="h-[300px] w-full"
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
          </div>
        </div>
      </div>
    </div>
  );
};
