import { render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";

import { PriceChart } from "../components/PriceChart";
import { TimeChart } from "../components/TimeChart";
import { YieldCurveChart } from "../components/YieldCurveChart";
import { useOptionsChart, useTimeChart, useYieldCurveChart } from "../contexts/chart";
import { usePaneIndex } from "../contexts/pane";

// Test components that use the hooks outside of their context providers
const InvalidTimeChartConsumer = () => {
  useTimeChart();
  return <div>Chart context value</div>;
};

const InvalidYieldCurveChartConsumer = () => {
  useYieldCurveChart();
  return <div>YieldCurveChart context value</div>;
};

const InvalidOptionsChartConsumer = () => {
  useOptionsChart();
  return <div>OptionsChart context value</div>;
};

// Test component that uses the pane index hook
const PaneIndexConsumer = () => {
  const paneIndex = usePaneIndex();
  return <div data-testid="pane-index">{paneIndex()}</div>;
};

describe("Chart Contexts", () => {
  test("useChart throws error when used outside of TimeChart", () => {
    // Capture console.error to prevent noise in test output
    const originalConsoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(() => <InvalidTimeChartConsumer />);
    }).toThrow("[solid-lightweight-charts] No parent TimeChart component found!");

    // Restore console.error
    console.error = originalConsoleError;
  });

  test("useYieldCurveChart throws error when used outside of YieldCurveChart", () => {
    // Capture console.error to prevent noise in test output
    const originalConsoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(() => <InvalidYieldCurveChartConsumer />);
    }).toThrow("[solid-lightweight-charts] No parent YieldCurveChart component found!");

    // Restore console.error
    console.error = originalConsoleError;
  });

  test("useOptionsChart throws error when used outside of PriceChart", () => {
    // Capture console.error to prevent noise in test output
    const originalConsoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(() => <InvalidOptionsChartConsumer />);
    }).toThrow("[solid-lightweight-charts] No parent OptionsChart component found!");

    // Restore console.error
    console.error = originalConsoleError;
  });

  test("useChart works correctly within TimeChart", () => {
    // This should not throw
    expect(() => {
      render(() => (
        <TimeChart>
          <TimeChart.Series type="Line" data={[{ time: "2023-01-01", value: 100 }]} />
        </TimeChart>
      ));
    }).not.toThrow();
  });

  test("useYieldCurveChart works correctly within YieldCurveChart", () => {
    // This should not throw
    expect(() => {
      render(() => (
        <YieldCurveChart>
          <YieldCurveChart.Series type="Line" data={[{ time: 0, value: 2.5 }]} />
        </YieldCurveChart>
      ));
    }).not.toThrow();
  });

  test("useOptionsChart works correctly within PriceChart", () => {
    // This should not throw
    expect(() => {
      render(() => (
        <PriceChart>
          <PriceChart.Series type="Line" data={[{ time: 0, value: 100 }]} />
        </PriceChart>
      ));
    }).not.toThrow();
  });
});

describe("Pane Context", () => {
  test("usePaneIndex returns default value 0 when used outside of a pane", () => {
    const { getByTestId } = render(() => <PaneIndexConsumer />);
    expect(getByTestId("pane-index").textContent).toBe("0");
  });

  test("usePaneIndex returns correct pane index within a pane", () => {
    const { getByTestId } = render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={[{ time: "2023-01-01", value: 100 }]} />
        <TimeChart.Pane index={2}>
          <PaneIndexConsumer />
        </TimeChart.Pane>
      </TimeChart>
    ));
    expect(getByTestId("pane-index").textContent).toBe("2");
  });

  test("usePaneIndex returns auto-incremented pane index when no index is specified", () => {
    const { getByTestId } = render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={[{ time: "2023-01-01", value: 100 }]} />
        <TimeChart.Pane>
          <PaneIndexConsumer />
        </TimeChart.Pane>
      </TimeChart>
    ));
    // First pane after the default one (0) gets index 1
    expect(getByTestId("pane-index").textContent).toBe("1");
  });
});
