import {
  createYieldCurveChart,
  type ISeriesApi,
  type IYieldCurveChartApi,
  type SeriesDefinition,
  type YieldCurveSeriesType,
} from "lightweight-charts";
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
import { useYieldCurveChart, YieldCurveChartContext } from "../contexts/chart";
import { PaneIndexContext, usePaneIndex } from "../contexts/pane";
import type {
  ChartCommonProps,
  ChartWithPaneState,
  CustomSeriesProps,
  PaneProps,
  SeriesPrimitive,
  SeriesProps,
} from "../types";

type YieldCurveChartOptions = NonNullable<Parameters<typeof createYieldCurveChart>[1]>;

/**
 * Props for the `YieldCurveChart` component, extending Lightweight Charts'
 * `createYieldCurveChart` configuration with chart lifecycle hooks.
 *
 * @property ref - Optional DOM element ref for the chart container.
 * @property onCreateChart - Callback invoked after the chart instance is created.
 * @property onResize - Callback triggered when the chart is manually resized (if `autoSize: false`).
 */
type YieldCurveChartProps = ChartCommonProps<IYieldCurveChartApi> & YieldCurveChartOptions;

/**
 * A SolidJS wrapper component for rendering yield curve charts using
 * TradingView's `createYieldCurveChart` API.
 *
 * Yield curve charts are specifically designed for plotting interest rate curves
 * over time-to-maturity durations. The X-axis is treated as a duration (not a date),
 * and grid/crosshair rendering behavior differs from time- and price-based charts.
 *
 * - Horizontal scale is linear and represents time durations (e.g., months)
 * - Whitespace gaps are not considered for crosshairs and grid lines
 * - Supports vertical panes and multiple overlayed series
 *
 * @example
 * ```tsx
 * <YieldCurveChart>
 *   <YieldCurveChart.Series type="Line" data={...} />
 *   <YieldCurveChart.Pane>
 *     <YieldCurveChart.Series type="Area" data={...} />
 *   </YieldCurveChart.Pane>
 * </YieldCurveChart>
 * ```
 *
 * @param props - Configuration and lifecycle hooks for the chart instance.
 */
export const YieldCurveChart = (props: ParentProps<YieldCurveChartProps>): JSX.Element => {
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

  const [chart, setChart] = createSignal<IYieldCurveChartApi>();

  onMount(() => {
    props.ref?.(chartContainer);
    const chart = createYieldCurveChart(
      chartContainer,
      chartOptions,
    ) as ChartWithPaneState<IYieldCurveChartApi>;

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
          <YieldCurveChartContext.Provider value={chart}>
            {containerProps.children}
          </YieldCurveChartContext.Provider>
        )}
      </Show>
    </>
  );
};

const Pane = (props: PaneProps) => {
  const chart = useYieldCurveChart() as unknown as Accessor<
    ChartWithPaneState<IYieldCurveChartApi>
  >;

  const paneIdx = createMemo(() => props.index ?? chart().__getNextPaneIndex());

  onCleanup(() => {
    chart().removePane(paneIdx());
  });

  return <PaneIndexContext.Provider value={paneIdx}>{props.children}</PaneIndexContext.Provider>;
};

/**
 * A vertical pane for the `YieldCurveChart`, used to stack series with separate Y-axes.
 *
 * Pane index `0` is reserved for the default pane. If `index` is omitted,
 * a unique index will be assigned automatically and incremented within the current chart instance.
 *
 * @example
 * ```tsx
 * <YieldCurveChart.Pane>
 *   <YieldCurveChart.Series type="Histogram" data={...} />
 * </YieldCurveChart.Pane>
 * ```
 *
 * @param props.index - Optional explicit pane index.
 */
YieldCurveChart.Pane = Pane;

const Series = <T extends YieldCurveSeriesType>(props: SeriesProps<T, number>) => {
  const chart = useYieldCurveChart();
  const paneIdx = usePaneIndex();

  const _props = mergeProps(
    {
      primitives: [] as SeriesPrimitive<T, number>[],
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
    const seriesDef = SERIES_DEFINITION_MAP[props.type] as SeriesDefinition<YieldCurveSeriesType>;
    const series = chart().addSeries(seriesDef, options, paneIdx()) as ISeriesApi<T, number>;
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
 * A series component for the `YieldCurveChart`, used to render data points
 * over duration-based X-axis values (e.g., months to maturity).
 *
 * This component attaches the series to the current pane context (default or custom).
 * All series use a numeric X-axis rather than date-based timestamps.
 *
 * @typeParam T - The supported series type for yield curve charts.
 *
 * @param props.type - Series type (e.g., `"Line"`, `"Area"`).
 * @param props.data - Numeric X-axis data to render (e.g., durations and values).
 * @param props.primitives - Optional [primitives](https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives) to attach to the series.
 * @param props.onCreateSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onRemoveSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onSetData - Optional callback fired after `setData()` is called.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/api/interfaces/IYieldCurveChartApi
 */
YieldCurveChart.Series = Series;

const CustomSeries = (props: CustomSeriesProps<number>) => {
  const chart = useYieldCurveChart();
  const paneIdx = usePaneIndex();

  const _props = mergeProps(
    {
      primitives: [] as SeriesPrimitive<"Custom", number>[],
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
 * A custom series component for the `YieldCurveChart`, used to render data points
 * over duration-based X-axis values (e.g., months to maturity).
 *
 * @param props.paneView - The required pane view for the custom series -- defines the basic functionality and structure required for creating a custom series view..
 * @param props.data - Numeric X-axis data to render (e.g., durations and values).
 * @param props.primitives - Optional [primitives](https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives) to attach to the series.
 * @param props.onCreateSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onRemoveSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onSetData - Optional callback fired after `setData()` is called.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/custom_series
 */
YieldCurveChart.CustomSeries = CustomSeries;
