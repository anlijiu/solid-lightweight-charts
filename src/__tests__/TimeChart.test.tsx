import { render, waitFor } from "@solidjs/testing-library";
import type { IChartApi, SeriesMarker, Time } from "lightweight-charts";
import { createSeriesMarkers } from "lightweight-charts";
import { createSignal } from "solid-js";
import { describe, expect, test, vi } from "vitest";

import { TimeChart } from "../components/TimeChart";

describe("CHART: TimeChart", () => {
  test("creates the lightweight-charts container", () => {
    const onCreateChartMock = vi.fn();

    const { container } = render(() => <TimeChart onCreateChart={onCreateChartMock} />);
    expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

    expect(onCreateChartMock).toHaveBeenCalled();
  });

  test("applies custom class and style", () => {
    const { container } = render(() => (
      <TimeChart class="custom-class" style={{ width: "500px" }} />
    ));

    const chartElement = container.firstChild as HTMLElement;
    expect(chartElement).toHaveClass("custom-class");
    expect(chartElement.style.width).toBe("500px");
  });

  test("applies chart options", async () => {
    let _timeChart: IChartApi;

    render(() => (
      <TimeChart
        timeScale={{
          timeVisible: true,
          secondsVisible: false,
        }}
        rightPriceScale={{
          visible: true,
          scaleMargins: { top: 0.1, bottom: 0.1 },
        }}
        onCreateChart={(chart) => {
          _timeChart = chart;
        }}
      />
    ));

    const chartOptions = _timeChart!.options();

    expect(chartOptions.timeScale.timeVisible).toBe(true);
    expect(chartOptions.timeScale.secondsVisible).toBe(false);
    expect(chartOptions.rightPriceScale.visible).toBe(true);
    expect(chartOptions.rightPriceScale.scaleMargins.top).toBe(0.1);
    expect(chartOptions.rightPriceScale.scaleMargins.bottom).toBe(0.1);
  });

  test("handles resize when autoSize is false", () => {
    let _timeChart: IChartApi;
    const onResizeMock = vi.fn();

    const [dimensions, setDimensions] = createSignal({
      width: 800,
      height: 400,
    });

    render(() => (
      <TimeChart
        autoSize={false}
        width={dimensions().width}
        height={dimensions().height}
        onResize={onResizeMock}
        onCreateChart={(chart) => {
          _timeChart = chart;
          vi.spyOn(_timeChart, "resize");
        }}
      />
    ));

    expect(_timeChart!).toBeDefined();

    setDimensions({ width: 1000, height: 500 });

    expect(_timeChart!.resize).toHaveBeenCalledWith(1000, 500, false);
    expect(onResizeMock).toHaveBeenCalledWith(1000, 500);
  });

  test("renders a series", async () => {
    const testData = [
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 105 },
    ];

    const onCreateSeriesMock = vi.fn();

    render(() => (
      <TimeChart>
        <TimeChart.Series
          type="Line"
          data={testData}
          onCreateSeries={onCreateSeriesMock}
          color="#ff0000"
        />
      </TimeChart>
    ));

    // Wait for the callback to be called
    await waitFor(() => {
      expect(onCreateSeriesMock).toHaveBeenCalled();
    });
  });

  test("updates series data when props change", async () => {
    const [data, setData] = createSignal([
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 105 },
    ]);

    render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={data()} />
      </TimeChart>
    ));

    // Update data after initial render
    await waitFor(() => {
      setData([
        { time: "2023-01-01", value: 100 },
        { time: "2023-01-02", value: 105 },
        { time: "2023-01-03", value: 110 },
      ]);
    });
  });

  test("renders multiple series", async () => {
    render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={[{ time: "2023-01-01", value: 100 }]} />
        <TimeChart.Series type="Area" data={[{ time: "2023-01-01", value: 90 }]} />
      </TimeChart>
    ));

    // The test passes if rendering completes without errors
    expect(true).toBe(true);
  });

  test("renders a pane with series", async () => {
    render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={[{ time: "2023-01-01", value: 100 }]} />
        <TimeChart.Pane>
          <TimeChart.Series type="Histogram" data={[{ time: "2023-01-01", value: 1000 }]} />
        </TimeChart.Pane>
      </TimeChart>
    ));

    // The test passes if rendering completes without errors
    expect(true).toBe(true);
  });

  test("calls onSetData when series data is set", async () => {
    const onSetDataMock = vi.fn();
    const testData = [
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 105 },
    ];

    render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={testData} onSetData={onSetDataMock} />
      </TimeChart>
    ));

    // Wait for series data to be set
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
    });
  });

  test("cleans up on unmount", async () => {
    const { unmount } = render(() => <TimeChart />);
    unmount();
    // If we got here without errors, the test passes
    expect(true).toBe(true);
  });

  test("works with createSeriesMarkers API", async () => {
    const onSetDataMock = vi.fn(({ series, data }) => {
      const markers: SeriesMarker<Time>[] = [
        {
          time: data[0].time,
          position: "aboveBar",
          color: "#f68410",
          shape: "circle",
          text: "Buy",
        } as SeriesMarker<Time>,
      ];
      createSeriesMarkers(series, markers);
    });

    render(() => (
      <TimeChart>
        <TimeChart.Series
          type="Line"
          data={[{ time: "2023-01-01", value: 100 }]}
          onSetData={onSetDataMock}
        />
      </TimeChart>
    ));

    // Verify onSetData was called
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
    });
  });
});
