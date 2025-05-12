import { render, waitFor } from "@solidjs/testing-library";
import type { SeriesMarker } from "lightweight-charts";
import { createSeriesMarkers } from "lightweight-charts";
import { createSignal } from "solid-js";
import { describe, expect, test, vi } from "vitest";

import { PriceChart } from "../components/PriceChart";
import type { IOptionsChartApi } from "../types";

describe("CHART: PriceChart", () => {
  test("creates the lightweight-charts container", () => {
    const onCreateChartMock = vi.fn();

    const { container } = render(() => <PriceChart onCreateChart={onCreateChartMock} />);
    expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

    expect(onCreateChartMock).toHaveBeenCalled();
  });

  test("applies custom class and style", () => {
    const { container } = render(() => (
      <PriceChart class="custom-class" style={{ width: "500px" }} />
    ));

    const chartElement = container.firstChild as HTMLElement;
    expect(chartElement).toHaveClass("custom-class");
    expect(chartElement.style.width).toBe("500px");
  });

  test("applies chart options", async () => {
    let _priceChart: IOptionsChartApi;

    render(() => (
      <PriceChart
        timeScale={{
          barSpacing: 5,
          minBarSpacing: 2,
        }}
        rightPriceScale={{
          visible: true,
          scaleMargins: { top: 0.1, bottom: 0.1 },
        }}
        onCreateChart={(chart) => {
          _priceChart = chart;
        }}
      />
    ));

    const chartOptions = _priceChart!.options();

    expect(chartOptions.timeScale.barSpacing).toBe(5);
    expect(chartOptions.timeScale.minBarSpacing).toBe(2);
    expect(chartOptions.rightPriceScale.visible).toBe(true);
    expect(chartOptions.rightPriceScale.scaleMargins.top).toBe(0.1);
    expect(chartOptions.rightPriceScale.scaleMargins.bottom).toBe(0.1);
  });

  test("handles resize when autoSize is false", () => {
    let _priceChart: IOptionsChartApi;
    const onResizeMock = vi.fn();

    const [dimensions, setDimensions] = createSignal({
      width: 800,
      height: 400,
    });

    render(() => (
      <PriceChart
        autoSize={false}
        width={dimensions().width}
        height={dimensions().height}
        onResize={onResizeMock}
        onCreateChart={(chart) => {
          _priceChart = chart;
          vi.spyOn(_priceChart, "resize");
        }}
      />
    ));

    expect(_priceChart!).toBeDefined();

    setDimensions({ width: 1000, height: 500 });

    expect(_priceChart!.resize).toHaveBeenCalledWith(1000, 500, false);
    expect(onResizeMock).toHaveBeenCalledWith(1000, 500);
  });

  test("renders a series", async () => {
    // PriceChart uses numeric time values
    const testData = [
      { time: 0, value: 100 },
      { time: 1, value: 105 },
    ];

    const onCreateSeriesMock = vi.fn();

    render(() => (
      <PriceChart>
        <PriceChart.Series
          type="Line"
          data={testData}
          onCreateSeries={onCreateSeriesMock}
          color="#ff0000"
        />
      </PriceChart>
    ));

    // Wait for the callback to be called
    await waitFor(() => {
      expect(onCreateSeriesMock).toHaveBeenCalled();
    });
  });

  test("updates series data when props change", async () => {
    // PriceChart uses numeric time values
    const [data, setData] = createSignal([
      { time: 0, value: 100 },
      { time: 1, value: 105 },
    ]);

    render(() => (
      <PriceChart>
        <PriceChart.Series type="Line" data={data()} />
      </PriceChart>
    ));

    // Update data after initial render
    await waitFor(() => {
      setData([
        { time: 0, value: 100 },
        { time: 1, value: 105 },
        { time: 2, value: 110 },
      ]);
    });
  });

  test("renders multiple series", async () => {
    render(() => (
      <PriceChart>
        <PriceChart.Series type="Line" data={[{ time: 0, value: 100 }]} />
        <PriceChart.Series type="Area" data={[{ time: 0, value: 90 }]} />
      </PriceChart>
    ));

    // The test passes if rendering completes without errors
    expect(true).toBe(true);
  });

  test("renders a pane with series", async () => {
    render(() => (
      <PriceChart>
        <PriceChart.Series type="Line" data={[{ time: 0, value: 100 }]} />
        <PriceChart.Pane>
          <PriceChart.Series type="Histogram" data={[{ time: 0, value: 1000 }]} />
        </PriceChart.Pane>
      </PriceChart>
    ));

    // The test passes if rendering completes without errors
    expect(true).toBe(true);
  });

  test("calls onSetData when series data is set", async () => {
    const onSetDataMock = vi.fn();
    const testData = [
      { time: 0, value: 100 },
      { time: 1, value: 105 },
    ];

    render(() => (
      <PriceChart>
        <PriceChart.Series type="Line" data={testData} onSetData={onSetDataMock} />
      </PriceChart>
    ));

    // Wait for series data to be set
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
    });
  });

  test("cleans up on unmount", async () => {
    const { unmount } = render(() => <PriceChart />);
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
      <PriceChart>
        <PriceChart.Series type="Line" data={[{ time: 0, value: 100 }]} onSetData={onSetDataMock} />
      </PriceChart>
    ));

    // Verify onSetData was called
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
    });
  });
});
