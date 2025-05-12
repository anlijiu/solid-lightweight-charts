import type {
  IChartApiBase,
  ISeriesApi,
  SeriesDataItemTypeMap,
  SeriesPartialOptionsMap,
  SeriesType,
  Time,
} from "lightweight-charts";
import type { JSX } from "solid-js";

// Special internal type to track the next pane index for chart instances
export type ChartWithPaneState<T> = T & {
  __nextPaneIndex: number;
  __getNextPaneIndex: () => number;
};

export type IOptionsChartApi = IChartApiBase<number>;
export type BuiltInSeriesType = Exclude<SeriesType, "Custom">;

/**
 * Common props for all chart components.
 */
export type ChartCommonProps<T> = {
  /**
   * The id of the chart container.
   */
  readonly id?: string;

  /**
   * The class name of the chart container.
   */
  readonly class?: string;

  /**
   * The style of the chart container.
   */
  readonly style?: JSX.CSSProperties;

  /**
   * Whether to force a repaint of the chart when the chart is resized.
   */
  readonly forceRepaintOnResize?: boolean;

  /**
   * The ref of the chart container.
   */
  readonly ref?: (el: HTMLDivElement) => void;

  /**
   * Callback function that is called when the chart is created.
   * @param chart - The created chart instance.
   */
  readonly onCreateChart?: (chart: T) => void;

  /**
   * Callback function that is called when the chart is resized. If autoSize is `true`, this will not be called.
   * @param width - The width of the chart.
   * @param height - The height of the chart.
   */
  readonly onResize?: (width: number, height: number) => void;
};

export type SeriesCommonProps<
  T extends BuiltInSeriesType,
  HorzScaleItem = Time,
> = SeriesPartialOptionsMap[T] & {
  /**
   * The data to be displayed in the series.
   */
  readonly data: SeriesDataItemTypeMap<HorzScaleItem>[T][];

  /**
   * Callback function that is called when the series is created.
   * @param series - The created line series instance.
   */
  readonly onCreateSeries?: (series: ISeriesApi<T, HorzScaleItem>, paneIndex: number) => void;
};

/**
 * Parameters passed to the onSetData callback function
 */
export type OnSetDataParams<T extends BuiltInSeriesType, HorzScaleItem = Time> = {
  /**
   * The series instance that had data set on it
   */
  readonly series: ISeriesApi<T, HorzScaleItem>;

  /**
   * The data that was set on the series
   */
  readonly data: SeriesDataItemTypeMap<HorzScaleItem>[T][];
};

export type SeriesProps<T extends BuiltInSeriesType, HorzScaleItem = Time> = SeriesCommonProps<
  T,
  HorzScaleItem
> & {
  /**
   * The type of the series.
   */
  readonly type: T;

  /**
   * Callback function that is called when the series data is set. Listening to this callback can be useful
   * for when you want to make use of the [createSeriesMarker](https://tradingview.github.io/lightweight-charts/tutorials/how_to/series-markers) API
   * to generate custom markers based on the data within the series.
   *
   * @param params - An object containing the series instance and the data being set
   */
  readonly onSetData?: (params: OnSetDataParams<T, HorzScaleItem>) => void;
};

export type PaneProps = {
  readonly index?: number;
  readonly children: JSX.Element;
};
