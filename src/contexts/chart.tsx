import type { IChartApi, IYieldCurveChartApi } from "lightweight-charts";
import { type Accessor, createContext, useContext } from "solid-js";

import type { IOptionsChartApi } from "../types";

export const ChartContext = createContext<Accessor<IChartApi>>();
export const OptionsChartContext = createContext<Accessor<IOptionsChartApi>>();
export const YieldCurveChartContext = createContext<Accessor<IYieldCurveChartApi>>();

export const useChart = () => {
  const ctx = useContext(ChartContext);

  if (!ctx) {
    throw new Error("[solid-lightweight-charts] No parent Chart component found!");
  }

  return ctx;
};

export const useOptionsChart = () => {
  const ctx = useContext(OptionsChartContext);

  if (!ctx) {
    throw new Error("[solid-lightweight-charts] No parent OptionsChart component found!");
  }

  return ctx;
};

export const useYieldCurveChart = () => {
  const ctx = useContext(YieldCurveChartContext);

  if (!ctx) {
    throw new Error("[solid-lightweight-charts] No parent YieldCurveChart component found!");
  }

  return ctx;
};
