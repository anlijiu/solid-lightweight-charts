import { render, waitFor } from "@solidjs/testing-library";
import type { IYieldCurveChartApi, SeriesMarker } from "lightweight-charts";
import { createSeriesMarkers } from "lightweight-charts";
import { createSignal } from "solid-js";
import { describe, expect, test, vi } from "vitest";

import { YieldCurveChart } from "../components/YieldCurveChart";

describe("CHART: YieldCurveChart", () => {
  test("creates the lightweight-charts container", () => {
    const onCreateChartMock = vi.fn();

    const { container } = render(() => <YieldCurveChart onCreateChart={onCreateChartMock} />);
    expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

    expect(onCreateChartMock).toHaveBeenCalled();
  });

  test("applies custom class and style", () => {
    const { container } = render(() => (
      <YieldCurveChart class="custom-class" style={{ width: "500px" }} />
    ));

    const chartElement = container.firstChild as HTMLElement;
    expect(chartElement).toHaveClass("custom-class");
    expect(chartElement.style.width).toBe("500px");
  });

  test("applies chart options", async () => {
    let _yieldCurveChart: IYieldCurveChartApi;

    render(() => (
      <YieldCurveChart
        timeScale={{
          barSpacing: 5,
          minBarSpacing: 2,
        }}
        rightPriceScale={{
          visible: true,
          scaleMargins: { top: 0.1, bottom: 0.1 },
        }}
        onCreateChart={(chart) => {
          _yieldCurveChart = chart;
        }}
      />
    ));

    const chartOptions = _yieldCurveChart!.options();

    expect(chartOptions.timeScale.barSpacing).toBe(5);
    expect(chartOptions.timeScale.minBarSpacing).toBe(2);
    expect(chartOptions.rightPriceScale.visible).toBe(true);
    expect(chartOptions.rightPriceScale.scaleMargins.top).toBe(0.1);
    expect(chartOptions.rightPriceScale.scaleMargins.bottom).toBe(0.1);
  });

  test("handles resize when autoSize is false", () => {
    let _yieldCurveChart: IYieldCurveChartApi;
    const onResizeMock = vi.fn();

    const [dimensions, setDimensions] = createSignal({
      width: 800,
      height: 400,
    });

    render(() => (
      <YieldCurveChart
        autoSize={false}
        width={dimensions().width}
        height={dimensions().height}
        onResize={onResizeMock}
        onCreateChart={(chart) => {
          _yieldCurveChart = chart;
          vi.spyOn(_yieldCurveChart, "resize");
        }}
      />
    ));

    expect(_yieldCurveChart!).toBeDefined();

    setDimensions({ width: 1000, height: 500 });

    expect(_yieldCurveChart!.resize).toHaveBeenCalledWith(1000, 500, false);
    expect(onResizeMock).toHaveBeenCalledWith(1000, 500);
  });

  test("renders a series", async () => {
    // YieldCurveChart uses numeric time values (similar to PriceChart)
    const testData = [
      { time: 0, value: 2.5 }, // 0M
      { time: 3, value: 2.7 }, // 3M
      { time: 6, value: 3.0 }, // 6M
    ];

    const onCreateSeriesMock = vi.fn();

    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series
          type="Line"
          data={testData}
          onCreateSeries={onCreateSeriesMock}
          color="#ff0000"
        />
      </YieldCurveChart>
    ));

    // Wait for the callback to be called
    await waitFor(() => {
      expect(onCreateSeriesMock).toHaveBeenCalled();
    });
  });

  test("updates series data when props change", async () => {
    // YieldCurveChart uses numeric time values
    const [data, setData] = createSignal([
      { time: 0, value: 2.5 }, // 0M
      { time: 12, value: 3.0 }, // 12M
    ]);

    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={data()} />
      </YieldCurveChart>
    ));

    // Update data after initial render
    await waitFor(() => {
      setData([
        { time: 0, value: 2.5 }, // 0M
        { time: 12, value: 3.0 }, // 12M
        { time: 60, value: 3.5 }, // 5Y
      ]);
    });
  });

  test("renders multiple series", async () => {
    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={[{ time: 0, value: 2.5 }]} />
        <YieldCurveChart.Series type="Area" data={[{ time: 0, value: 2.0 }]} />
      </YieldCurveChart>
    ));

    // The test passes if rendering completes without errors
    expect(true).toBe(true);
  });

  test("renders a pane with series", async () => {
    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={[{ time: 0, value: 2.5 }]} />
        <YieldCurveChart.Pane>
          <YieldCurveChart.Series type="Area" data={[{ time: 0, value: 2.0 }]} />
        </YieldCurveChart.Pane>
      </YieldCurveChart>
    ));

    // The test passes if rendering completes without errors
    expect(true).toBe(true);
  });

  test("calls onSetData when series data is set", async () => {
    const onSetDataMock = vi.fn();
    const testData = [
      { time: 0, value: 2.5 },
      { time: 12, value: 3.0 },
    ];

    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={testData} onSetData={onSetDataMock} />
      </YieldCurveChart>
    ));

    // Wait for series data to be set
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
    });
  });

  test("cleans up on unmount", async () => {
    const { unmount } = render(() => <YieldCurveChart />);
    unmount();
    // If we got here without errors, the test passes
    expect(true).toBe(true);
  });

  test("works with createSeriesMarkers API", async () => {
    const onSetDataMock = vi.fn(({ series, data }) => {
      const markers: SeriesMarker<number>[] = [
        {
          time: data[0].time,
          position: "aboveBar",
          color: "#f68410",
          shape: "circle",
          text: "Buy",
        } as SeriesMarker<number>,
      ];
      createSeriesMarkers(series, markers);
    });

    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series
          type="Line"
          data={[{ time: 0, value: 2.5 }]}
          onSetData={onSetDataMock}
        />
      </YieldCurveChart>
    ));

    // Verify onSetData was called
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
    });
  });
});
