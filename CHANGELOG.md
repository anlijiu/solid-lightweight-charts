# @dschz/solid-lightweight-charts

## 0.1.2

### Patch Changes

- adds solid-js as dev dependency for jsr

## 0.1.1

### Patch Changes

- adds lightweight chart to dev dependencies

## 0.1.0

### Initial Release

**The MVP release** of @dschz/solid-lightweight-charts - A fully typed SolidJS wrapper around TradingView's Lightweight Charts

- **Multiple chart types** with specialized APIs:
  - `TimeChart` for time-based financial data (using `createChart`)
  - `PriceChart` for numeric-based price data (using `createOptionsChart`)
  - `YieldCurveChart` for rate curves and duration-based data (using `createYieldCurveChart`)
- **Complete series type support** for all built-in chart types: Line, Area, Candlestick, Bar, Histogram, Baseline
- **Namespaced component APIs** with intuitive syntax (`<TimeChart.Series />`, `<PriceChart.Series />`, `<YieldCurveChart.Series />`)
- **Multiple panes support** for advanced multi-series visualization (`<TimeChart.Pane />`, `<PriceChart.Pane />`, `<YieldCurveChart.Pane />`)
- **Series markers support** with integration for core `lightweight-charts` APIs (e.g. `createSeriesMarkers`)
- **SolidJS-native reactivity** for all chart options and data updates
- **Proper lifecycle management** and automatic state cleanup
- **Full TypeScript support** with comprehensive type definitions
- **Flexible data handling** with `onSetData` callbacks for advanced chart manipulation
- **Core API compatibility** - can still access underlying `lightweight-charts` APIs for advanced features
