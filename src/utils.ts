import type { IPaneApi, Time } from "lightweight-charts";

import type { PanePrimitive } from "./types";

export const detachPanePrimitives = <HorzScaleItem = Time>(
  primitives: PanePrimitive<HorzScaleItem>[],
  pane?: IPaneApi<HorzScaleItem>,
) => {
  if (!pane) return;

  for (const primitive of primitives) {
    pane.detachPrimitive(primitive);
  }
};

export const attachPanePrimitives = <HorzScaleItem = Time>(
  primitives: PanePrimitive<HorzScaleItem>[],
  pane?: IPaneApi<HorzScaleItem>,
) => {
  if (!pane) return;

  // Detach the primitives from the pane before attaching them again
  detachPanePrimitives(primitives, pane);

  for (const primitive of primitives) {
    pane.attachPrimitive(primitive);
  }
};
