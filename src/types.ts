import type {
  CustomData,
  CustomSeriesOptions,
  IChartApiBase,
  ICustomSeriesPaneView,
  IPaneApi,
  IPanePrimitive,
  ISeriesApi,
  ISeriesPrimitiveBase,
  SeriesAttachedParameter,
  SeriesDataItemTypeMap,
  SeriesMarker,
  SeriesPartialOptionsMap,
  SeriesType,
  Time,
} from "lightweight-charts";
import type { Accessor, JSX } from "solid-js";

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

/**
 * The type for the Lightweight Charts pane primitive object.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/pane-primitives
 */
export type PanePrimitive<HorzScaleItem = Time> = IPanePrimitive<HorzScaleItem>;

/**
 * The type for the Lightweight Charts series primitive object.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives
 */
export type SeriesPrimitive<T extends SeriesType, HorzScaleItem = Time> = ISeriesPrimitiveBase<
  SeriesAttachedParameter<HorzScaleItem, T>
>;

export type SeriesCommonProps<
  T extends SeriesType,
  HorzScaleItem = Time,
> = SeriesPartialOptionsMap[T] & {
  /**
   * The data to be displayed in the series.
   */
  readonly data: SeriesDataItemTypeMap<HorzScaleItem>[T][];

  /**
   * The primitives to be used for the series.
   *
   * @see https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives
   */
  readonly primitives?: SeriesPrimitive<T, HorzScaleItem>[];

  /**
   * The markers to be used for the series.
   */
  readonly markers?: (
    data: SeriesDataItemTypeMap<HorzScaleItem>[T][],
  ) => SeriesMarker<HorzScaleItem>[];

  /**
   * Callback function that is called when the series is created.
   * @param series - The created line series instance.
   */
  readonly onCreateSeries?: (series: ISeriesApi<T, HorzScaleItem>, paneIndex: number) => void;

  /**
   * Callback function that is called when the series is removed.
   * @param series - The removed line series instance.
   */
  readonly onRemoveSeries?: (series: ISeriesApi<T, HorzScaleItem>, paneIndex: number) => void;

  /**
   * Callback function that is called when the series data is set. Listening to this callback can be useful
   * for when you want to make use of the [createSeriesMarker](https://tradingview.github.io/lightweight-charts/tutorials/how_to/series-markers) API
   * to generate custom markers based on the data within the series.
   *
   * @param params - An object containing the series instance and the data being set
   */
  readonly onSetData?: (params: OnSetDataParams<T, HorzScaleItem>) => void;

  /**
   * Callback function that is called when the series markers are set.
   * @param markers - The markers that were set on the series
   */
  readonly onSetMarkers?: (markers: SeriesMarker<HorzScaleItem>[]) => void;

  /**
   * Callback function that is called when the series primitives are attached.
   * @param primitives - The primitives that were attached to the series
   */
  readonly onAttachPrimitives?: (primitives: SeriesPrimitive<T, HorzScaleItem>[]) => void;

  /**
   * Callback function that is called when the series primitives are detached.
   * @param primitives - The primitives that were detached from the series
   */
  readonly onDetachPrimitives?: (primitives: SeriesPrimitive<T, HorzScaleItem>[]) => void;
};

/**
 * Parameters passed to the onSetData callback function
 */
export type OnSetDataParams<T extends SeriesType, HorzScaleItem = Time> = {
  /**
   * The series instance that had data set on it
   */
  readonly series: ISeriesApi<T, HorzScaleItem>;

  /**
   * The data that was set on the series
   */
  readonly data: SeriesDataItemTypeMap<HorzScaleItem>[T][];
};

/**
 * Props for the Lightweight Charts Series component.
 */
export type SeriesProps<T extends BuiltInSeriesType, HorzScaleItem = Time> = SeriesCommonProps<
  T,
  HorzScaleItem
> & {
  /**
   * The type of the series.
   */
  readonly type: T;
};

/**
 * The type for the Lightweight Charts custom series pane view object.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/custom_series
 */
export type CustomSeriesPaneView<HorzScaleItem = Time> = ICustomSeriesPaneView<
  HorzScaleItem,
  CustomData<HorzScaleItem>,
  CustomSeriesOptions
>;

/**
 * Props for the Lightweight Charts Custom Series component.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/custom_series
 */
export type CustomSeriesProps<HorzScaleItem = Time> = SeriesCommonProps<"Custom", HorzScaleItem> & {
  readonly paneView: CustomSeriesPaneView<HorzScaleItem>;
};

export type PaneContextType<HorzScaleItem = Time> = {
  readonly paneIdx: Accessor<number>;
  readonly panePrimitives: Accessor<PanePrimitive<HorzScaleItem>[]>;
  readonly attachPanePrimitives: (
    primitives: PanePrimitive<HorzScaleItem>[],
    pane?: IPaneApi<HorzScaleItem>,
  ) => void;
  readonly detachPanePrimitives: (
    primitives: PanePrimitive<HorzScaleItem>[],
    pane?: IPaneApi<HorzScaleItem>,
  ) => void;
};

/**
 * Props for the Lightweight Charts Pane component.
 */
export type PaneProps<HorzScaleItem = Time> = {
  /**
   * The index of the pane.
   */
  readonly index?: number;

  /**
   * The children of the pane.
   */
  readonly children: JSX.Element;

  /**
   * The primitives to be used for the pane.
   *
   * @see https://tradingview.github.io/lightweight-charts/docs/plugins/pane-primitives
   */
  readonly primitives?: PanePrimitive<HorzScaleItem>[];

  /**
   * Callback function that is called when the pane primitives are attached.
   * @param primitives - The primitives that were attached to the pane
   */
  readonly onAttachPrimitives?: (primitives: PanePrimitive<HorzScaleItem>[]) => void;

  /**
   * Callback function that is called when the pane primitives are detached.
   * @param primitives - The primitives that were detached from the pane
   */
  readonly onDetachPrimitives?: (primitives: PanePrimitive<HorzScaleItem>[]) => void;
};
