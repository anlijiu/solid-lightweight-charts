import {
  AreaSeries,
  BarSeries,
  BaselineSeries,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  type SeriesDefinition,
} from "lightweight-charts";

import type { BuiltInSeriesType } from "./types";

export const SERIES_DEFINITION_MAP: Record<
  BuiltInSeriesType,
  SeriesDefinition<BuiltInSeriesType>
> = {
  Area: AreaSeries,
  Line: LineSeries,
  Candlestick: CandlestickSeries,
  Bar: BarSeries,
  Histogram: HistogramSeries,
  Baseline: BaselineSeries,
};
