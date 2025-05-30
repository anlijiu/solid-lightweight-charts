import { A, Route, Router } from "@solidjs/router";
import { For, type JSX, type ParentProps } from "solid-js";

import { DynamicExample } from "./pages/DynamicExample";
import { Home } from "./pages/Home";
import { PanePrimitivesExample } from "./pages/PanePrimitivesExample";
import { PerformanceExample } from "./pages/PerformanceExample";
import { PriceChartExample } from "./pages/PriceChartExample";
import { SeriesPrimitivesExample } from "./pages/SeriesPrimitivesExample";
import { TimeChartExample } from "./pages/TimeChartExample";
import { YieldCurveChartExample } from "./pages/YieldCurveChartExample";

type ExamplePage = {
  readonly path: string;
  readonly name: string;
  readonly component: () => JSX.Element;
};

const examples: ExamplePage[] = [
  {
    path: "/timechart",
    name: "TimeChart",
    component: TimeChartExample,
  },
  {
    path: "/pricechart",
    name: "PriceChart",
    component: PriceChartExample,
  },
  {
    path: "/yieldcurve",
    name: "YieldCurveChart",
    component: YieldCurveChartExample,
  },
  {
    path: "/series-primitives",
    name: "Series Primitives",
    component: SeriesPrimitivesExample,
  },
  {
    path: "/pane-primitives",
    name: "Pane Primitives",
    component: PanePrimitivesExample,
  },
  {
    path: "/dynamic",
    name: "Dynamic Management",
    component: DynamicExample,
  },
  {
    path: "/performance",
    name: "Performance",
    component: PerformanceExample,
  },
];

function Navigation() {
  return (
    <nav class="bg-gray-800 text-white p-4">
      <div class="container mx-auto">
        <h1 class="text-2xl font-bold mb-4">
          <A href="/" class="hover:text-gray-300">
            Solid Lightweight Charts
          </A>
        </h1>
        <div class="flex flex-wrap gap-4">
          <For each={examples}>
            {(example) => (
              <A
                href={example.path}
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                activeClass="bg-blue-800"
              >
                {example.name}
              </A>
            )}
          </For>
        </div>
      </div>
    </nav>
  );
}

function RootLayout(props: ParentProps) {
  return (
    <div class="min-h-screen">
      <Navigation />
      <main class="min-h-screen bg-gray-50">{props.children}</main>
    </div>
  );
}

export const App = () => {
  return (
    <Router root={RootLayout}>
      <Route path="/" component={Home} />
      <For each={examples}>
        {(example) => <Route path={example.path} component={example.component} />}
      </For>
    </Router>
  );
};
