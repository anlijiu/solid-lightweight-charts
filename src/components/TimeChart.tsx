import { createChart, type IChartApi, type ISeriesApi, type Time } from "lightweight-charts";
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
import { TimeChartContext, useTimeChart } from "../contexts/chart";
import { PaneIndexContext, usePaneIndex } from "../contexts/pane";
import type {
  BuiltInSeriesType,
  ChartCommonProps,
  ChartWithPaneState,
  CustomSeriesProps,
  PaneProps,
  SeriesPrimitive,
  SeriesProps,
} from "../types";

type TimeChartOptions = NonNullable<Parameters<typeof createChart>[1]>;

/**
 * Props accepted by the `TimeChart` component.
 *
 * In addition to the standard Lightweight Charts options, it supports:
 *
 * - `ref`: optional access to the chart's container DOM element
 * - `onCreateChart`: callback when the chart instance is created
 * - `onResize`: callback after a manual resize (if `autoSize` is false)
 */
type TimeChartProps = ChartCommonProps<IChartApi> & TimeChartOptions;

/**
 * A SolidJS wrapper component for creating a time-based chart using
 * TradingView's `createChart` function from Lightweight Charts.
 *
 * This component sets up the chart lifecycle, provides chart context to child components,
 * and supports auto-sizing or fixed-size rendering.
 *
 * @example
 * ```tsx
 * <TimeChart>
 *   <TimeChart.Series type="Line" data={...} />
 *   <TimeChart.Pane>
 *     <TimeChart.Series type="Histogram" data={...} />
 *   </TimeChart.Pane>
 * </TimeChart>
 * ```
 *
 * @param props - Chart configuration and lifecycle callbacks.
 */
export const TimeChart = (props: ParentProps<TimeChartProps>): JSX.Element => {
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

  const [chart, setChart] = createSignal<IChartApi>();

  onMount(() => {
    props.ref?.(chartContainer);
    const chart = createChart(chartContainer, chartOptions) as ChartWithPaneState<IChartApi>;

    chart.__nextPaneIndex = 1; // 0 is the default pane
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
          <TimeChartContext.Provider value={chart}>
            {containerProps.children}
          </TimeChartContext.Provider>
        )}
      </Show>
    </>
  );
};

const Pane = (props: PaneProps) => {
  const chart = useTimeChart() as unknown as Accessor<ChartWithPaneState<IChartApi>>;

  const paneIdx = createMemo(() => props.index ?? chart().__getNextPaneIndex());

  onCleanup(() => {
    chart().removePane(paneIdx());
  });

  return <PaneIndexContext.Provider value={paneIdx}>{props.children}</PaneIndexContext.Provider>;
};

/**
 * Represents an individual pane within a `TimeChart`.
 *
 * If no `index` is provided, the pane index will be automatically assigned and incremented.
 * Each pane hosts its own Y-axis scale, and can be used to render series like volume or indicators
 * separately from the primary chart area.
 *
 * Pane index `0` is reserved for the default pane.
 *
 * @example
 * ```tsx
 * <TimeChart.Pane>
 *   <TimeChart.Series type="Histogram" data={volumeData} />
 * </TimeChart.Pane>
 * ```
 *
 * @param props.index - Optional pane index to explicitly control placement.
 */
TimeChart.Pane = Pane;

const Series = <T extends BuiltInSeriesType>(props: SeriesProps<T>) => {
  const chart = useTimeChart();
  const paneIdx = usePaneIndex();

  const _props = mergeProps(
    {
      primitives: [] as SeriesPrimitive<T, Time>[],
    },
    props,
  );

  const [local, options] = splitProps(_props, [
    "data",
    "primitives",
    "onCreateSeries",
    "onRemoveSeries",
    "onSetData",
  ]);

  onMount(() => {
    const series = chart().addSeries(
      SERIES_DEFINITION_MAP[props.type],
      options,
      paneIdx(),
    ) as ISeriesApi<T>;
    local.onCreateSeries?.(series, paneIdx());

    createEffect(() => {
      series.setData(local.data);
      local.onSetData?.({ series, data: local.data });
    });

    createEffect(() => {
      series.applyOptions(options);
    });

    createEffect(() => {
      for (const primitive of local.primitives) {
        series.attachPrimitive(primitive);
      }

      onCleanup(() => {
        for (const primitive of local.primitives) {
          series.detachPrimitive(primitive);
        }
      });
    });

    onCleanup(() => {
      chart().removeSeries(series);
      local.onRemoveSeries?.(series, paneIdx());
    });
  });

  return null;
};

/**
 * Renders a series (Line, Area, Candlestick, etc.) within a `TimeChart`.
 *
 * This component must be a child of `<TimeChart>` or `<TimeChart.Pane>`, and will automatically
 * attach itself to the correct pane based on context.
 *
 * @typeParam T - The built-in series type (e.g., `"Line"`, `"Area"`, `"Candlestick"`, etc.)
 *
 * @param props.type - The type of series to render.
 * @param props.data - The time-series data to be displayed.
 * @param props.onCreateSeries - Optional callback that receives the underlying `ISeriesApi<T>`.
 * @param props.onSetData - Optional callback fired after `setData()` is called.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/api/interfaces/ISeriesApi
 * @see https://tradingview.github.io/lightweight-charts/docs/series-types
 */
TimeChart.Series = Series;

const CustomSeries = (props: CustomSeriesProps<Time>) => {
  const chart = useTimeChart();
  const paneIdx = usePaneIndex();

  const _props = mergeProps(
    {
      primitives: [] as SeriesPrimitive<"Custom", Time>[],
    },
    props,
  );

  const [local, options] = splitProps(_props, [
    "data",
    "primitives",
    "onCreateSeries",
    "onRemoveSeries",
    "onSetData",
    "paneView",
  ]);

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

    createEffect(() => {
      for (const primitive of local.primitives) {
        series.attachPrimitive(primitive);
      }

      onCleanup(() => {
        for (const primitive of local.primitives) {
          series.detachPrimitive(primitive);
        }
      });
    });

    onCleanup(() => {
      chart().removeSeries(series);
      local.onRemoveSeries?.(series, paneIdx());
    });
  });

  return null;
};

/**
 * A custom series component for the `TimeChart`, used to render data points
 * over time-based X-axis values (e.g., dates and values).
 *
 * @param props.paneView - The required pane view for the custom series -- defines the basic functionality and structure required for creating a custom series view.
 * @param props.data - Time-series data to render (e.g., dates and values).
 * @param props.primitives - Optional [primitives](https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives) to attach to the series.
 * @param props.onCreateSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onRemoveSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onSetData - Optional callback fired after `setData()` is called.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/custom_series
 */
TimeChart.CustomSeries = CustomSeries;
