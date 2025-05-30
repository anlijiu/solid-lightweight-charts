import { A } from "@solidjs/router";

export const Home = () => {
  return (
    <div class="container mx-auto p-8">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-gray-900 mb-4">Solid Lightweight Charts</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          A SolidJS wrapper for TradingView's Lightweight Charts library. Create beautiful,
          interactive financial charts with ease.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">TimeChart</h3>
            <p class="text-gray-600 mb-4">
              Time-series charts with date-based X-axis. Perfect for candlestick, line, and volume
              data.
            </p>
            <A
              href="/timechart"
              class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              View Example
            </A>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">PriceChart</h3>
            <p class="text-gray-600 mb-4">
              Price-based charts with numeric X-axis. Ideal for correlations and price-vs-price
              analysis.
            </p>
            <A
              href="/pricechart"
              class="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              View Example
            </A>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">YieldCurveChart</h3>
            <p class="text-gray-600 mb-4">
              Specialized for yield curves with duration-based X-axis. Perfect for interest rate
              analysis.
            </p>
            <A
              href="/yieldcurve"
              class="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              View Example
            </A>
          </div>
        </div>
      </div>

      <div class="grid md:grid-cols-1 gap-8 mb-12">
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="text-center">
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Series Primitives</h3>
            <p class="text-gray-600 mb-4">
              Advanced custom visualizations using primitives. Create trend lines,
              support/resistance levels, price alerts, annotations, and custom drawings with the
              Canvas 2D API.
            </p>
            <A
              href="/series-primitives"
              class="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              View Primitives Demo
            </A>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="text-center">
            <div class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Pane Primitives</h3>
            <p class="text-gray-600 mb-4">
              Draw backgrounds, overlays, and decorations across entire chart panes. Create
              watermarks, custom grids, corner badges, and informational elements with full pane
              control.
            </p>
            <A
              href="/pane-primitives"
              class="inline-block px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            >
              View Pane Primitives
            </A>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Dynamic Chart Management</h3>
            <p class="text-gray-600 mb-4">
              Interactive example demonstrating real-time updates, series lifecycle management, and
              dynamic chart manipulation with proper cleanup and reactive data.
            </p>
            <A
              href="/dynamic"
              class="inline-block px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              View Interactive Demo
            </A>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Performance & Memory Management</h3>
          <p class="text-gray-600 mb-4">
            Monitor memory usage, test large datasets, and learn performance best practices for
            handling high-frequency data updates and memory optimization.
          </p>
          <A
            href="/performance"
            class="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            View Performance Monitor
          </A>
        </div>
      </div>

      <div class="bg-gray-50 p-8 rounded-lg">
        <h2 class="text-2xl font-bold text-gray-900 mb-4 text-center">Features</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="text-center">
            <h4 class="font-semibold text-gray-800 mb-2">Reactive</h4>
            <p class="text-sm text-gray-600">Built with SolidJS reactivity in mind</p>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-gray-800 mb-2">TypeScript</h4>
            <p class="text-sm text-gray-600">Full TypeScript support with type safety</p>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-gray-800 mb-2">Multiple Panes</h4>
            <p class="text-sm text-gray-600">Support for multiple chart panes with auto-cleanup</p>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-gray-800 mb-2">Series Markers</h4>
            <p class="text-sm text-gray-600">Interactive markers and annotations</p>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-gray-800 mb-2">Dynamic Updates</h4>
            <p class="text-sm text-gray-600">Real-time data with proper lifecycle management</p>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-gray-800 mb-2">Performance</h4>
            <p class="text-sm text-gray-600">Memory monitoring and optimization tools</p>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-gray-800 mb-2">Custom Series</h4>
            <p class="text-sm text-gray-600">Support for custom series and primitives</p>
          </div>
          <div class="text-center">
            <h4 class="font-semibold text-gray-800 mb-2">Auto Cleanup</h4>
            <p class="text-sm text-gray-600">Automatic pane and series cleanup on unmount</p>
          </div>
        </div>
      </div>

      <div class="text-center mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
        <p class="text-gray-600 mb-6">
          Install the package and start creating beautiful charts in your SolidJS application.
        </p>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg inline-block">
          <code>npm install solid-lightweight-charts</code>
        </div>
      </div>
    </div>
  );
};
