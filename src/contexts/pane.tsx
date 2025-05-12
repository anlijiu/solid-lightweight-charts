import { type Accessor, createContext, useContext } from "solid-js";

export const PaneIndexContext = createContext<Accessor<number>>(() => 0);

export const usePaneIndex = () => {
  return useContext(PaneIndexContext);
};
