import { createOptionsChart, type ISeriesApi, type SeriesType } from "lightweight-charts";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  mergeProps,
  onCleanup,
  onMount,
  type ParentProps,
  Show,
  splitProps,
} from "solid-js";

import { SERIES_DEFINITION_MAP } from "../constants";
import { OptionsChartContext, useOptionsChart } from "../contexts/chart";
import { PaneIndexContext, usePaneIndex } from "../contexts/pane";
import type {
  ChartCommonProps,
  ChartWithPaneState,
  CustomSeriesProps,
  IOptionsChartApi,
  PaneProps,
  SeriesProps,
} from "../types";

type OptionsChartOptions = NonNullable<Parameters<typeof createOptionsChart>[1]>;

/**
 * Props for `PriceChart`, extending standard Lightweight Charts options
 * used in the `createOptionsChart` API.
 *
 * Includes chart lifecycle callbacks and responsive sizing behavior.
 *
 * @property ref - Optional DOM element ref callback
 * @property onCreateChart - Callback invoked with the chart instance after creation
 * @property onResize - Callback triggered on manual resize (only if `autoSize: false`)
 */
type OptionsChartProps = ChartCommonProps<IOptionsChartApi> & OptionsChartOptions;

/**
 * A SolidJS wrapper component for rendering horizontally price-scaled charts using
 * TradingView's `createOptionsChart` API.
 *
 * This chart is ideal for visualizing non-time-based data like:
 * - Option chains (e.g., time-to-expiry as X-axis)
 * - Custom indicators with numeric axes
 * - Static or synthetic data where time is not the primary domain
 *
 * Supports panes, series, and both auto-sized and fixed dimensions.
 *
 * @example
 * ```tsx
 * <PriceChart>
 *   <PriceChart.Series type="Line" data={...} />
 *   <PriceChart.Pane>
 *     <PriceChart.Series type="Histogram" data={...} />
 *   </PriceChart.Pane>
 * </PriceChart>
 * ```
 *
 * @param props - Options chart configuration and lifecycle hooks.
 */
export const PriceChart = (props: ParentProps<OptionsChartProps>): JSX.Element => {
  let chartContainer!: HTMLDivElement;

  const [containerProps, options] = splitProps(props, [
    "id",
    "class",
    "ref",
    "style",
    "onCreateChart",
    "onResize",
    "children",
  ]);

  const _options = mergeProps(
    {
      autoSize: true,
      width: 0,
      height: 0,
      forceRepaintOnResize: false,
    },
    options,
  );

  const [resizeProps, chartOptions] = splitProps(_options, [
    "width",
    "height",
    "forceRepaintOnResize",
  ]);

  const [chart, setChart] = createSignal<IOptionsChartApi>();

  onMount(() => {
    props.ref?.(chartContainer);
    const chart = createOptionsChart(
      chartContainer,
      chartOptions,
    ) as ChartWithPaneState<IOptionsChartApi>;

    chart.__nextPaneIndex = 1;
    chart.__getNextPaneIndex = () => chart.__nextPaneIndex++;

    setChart(chart);

    containerProps.onCreateChart?.(chart);

    createEffect(() => {
      if (chartOptions.autoSize) return;
      chart.resize(resizeProps.width, resizeProps.height, resizeProps.forceRepaintOnResize);
      containerProps.onResize?.(resizeProps.width, resizeProps.height);
    });

    createEffect(() => {
      chart.applyOptions(chartOptions);
    });

    onCleanup(() => {
      chart.remove();
    });
  });

  return (
    <>
      <div
        id={containerProps.id}
        class={containerProps.class}
        style={containerProps.style}
        ref={chartContainer}
      />
      <Show when={chart()}>
        {(chart) => (
          <OptionsChartContext.Provider value={chart}>
            {containerProps.children}
          </OptionsChartContext.Provider>
        )}
      </Show>
    </>
  );
};

const Pane = (props: PaneProps) => {
  const chart = useOptionsChart() as unknown as Accessor<ChartWithPaneState<IOptionsChartApi>>;

  const paneIdx = createMemo(() => props.index ?? chart().__getNextPaneIndex());

  onCleanup(() => {
    chart().removePane(paneIdx());
  });

  return <PaneIndexContext.Provider value={paneIdx}>{props.children}</PaneIndexContext.Provider>;
};

/**
 * Defines a vertical pane within a `PriceChart`.
 *
 * If `index` is not provided, it will automatically increment the pane index per chart instance,
 * starting from `1`. The default pane index is `0`.
 *
 * Each pane receives its own Y-axis and is stacked vertically within the chart layout.
 *
 * @example
 * ```tsx
 * <PriceChart.Pane>
 *   <PriceChart.Series type="Histogram" data={...} />
 * </PriceChart.Pane>
 * ```
 *
 * @param props.index - Optional pane index (auto-assigned if omitted)
 */
PriceChart.Pane = Pane;

const Series = <T extends Exclude<SeriesType, "Custom">>(props: SeriesProps<T, number>) => {
  const chart = useOptionsChart();
  const paneIdx = usePaneIndex();
  const [local, options] = splitProps(props, ["data", "onCreateSeries", "onSetData"]);

  onMount(() => {
    const series = chart().addSeries(SERIES_DEFINITION_MAP[props.type], options, paneIdx());
    local.onCreateSeries?.(series as ISeriesApi<T, number>, paneIdx());

    createEffect(() => {
      series.setData(local.data);
      local.onSetData?.({ series: series as ISeriesApi<T, number>, data: local.data });
    });

    createEffect(() => {
      series.applyOptions(options);
    });

    onCleanup(() => {
      chart().removeSeries(series);
    });
  });

  return null;
};

/**
 * Renders a specific series (e.g., Line, Histogram, Area) into a `PriceChart` instance.
 * The series X-axis is price/numeric-based instead of time.
 *
 * This component reads the active pane index from context and attaches itself accordingly.
 *
 * @typeParam T - Series type (e.g., `"Line"`, `"Area"`, `"Candlestick"`, etc.)
 *
 * @param props.type - Type of series to add.
 * @param props.data - Numeric X-axis data to plot.
 * @param props.onCreateSeries - Optional callback when the underlying `ISeriesApi` is created.
 * @param props.onSetData - Optional callback triggered after setting the data.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/api/interfaces/IOptionsChartApi
 */
PriceChart.Series = Series;

const CustomSeries = (props: CustomSeriesProps<number>) => {
  const chart = useOptionsChart();
  const paneIdx = usePaneIndex();
  const [local, options] = splitProps(props, ["data", "onCreateSeries", "onSetData", "paneView"]);

  onMount(() => {
    const series = chart().addCustomSeries(local.paneView, options, paneIdx());
    local.onCreateSeries?.(series, paneIdx());

    createEffect(() => {
      series.setData(local.data);
      local.onSetData?.({ series, data: local.data });
    });

    createEffect(() => {
      series.applyOptions(options);
    });

    onCleanup(() => {
      chart().removeSeries(series);
    });
  });

  return null;
};

/**
 * A custom series component for the `PriceChart`, used to render data points
 * over price-based X-axis values (e.g., prices and values).
 *
 * @param props.paneView - The required pane view for the custom series -- defines the basic functionality and structure required for creating a custom series view.
 * @param props.data - Numeric X-axis data to render (e.g., prices and values).
 * @param props.primitives - Optional [primitives](https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives) to attach to the series.
 * @param props.onCreateSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onRemoveSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onSetData - Optional callback fired after `setData()` is called.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/custom_series
 */
PriceChart.CustomSeries = CustomSeries;
