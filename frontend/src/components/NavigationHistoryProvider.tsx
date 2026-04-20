import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { getLabelForPath } from "../navigation/routeLabels";

type HistoryEntry = {
  key: string;
  pathname: string;
};

type NavigationHistoryContextValue = {
  stack: HistoryEntry[];
};

const NavigationHistoryContext = createContext<NavigationHistoryContextValue>({
  stack: [],
});

type Action =
  | { type: "PUSH"; entry: HistoryEntry }
  | { type: "POP"; entry: HistoryEntry }
  | { type: "REPLACE"; entry: HistoryEntry };

const reducer = (state: HistoryEntry[], action: Action): HistoryEntry[] => {
  switch (action.type) {
    case "PUSH":
      return [...state, action.entry];
    case "POP": {
      const idx = state.findIndex((e) => e.key === action.entry.key);
      if (idx === -1) return [action.entry];
      return state.slice(0, idx + 1);
    }
    case "REPLACE": {
      if (state.length === 0) return [action.entry];
      const newState = [...state.slice(0, -1), action.entry];

      const last = newState[newState.length - 1]?.pathname;
      const secondLast = newState[newState.length - 2]?.pathname;
      if (last !== undefined && last === secondLast) {
        return newState.slice(0, -1);
      }

      return newState;
    }
  }
};

const InnerProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [stack, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const entry: HistoryEntry = {
      key: location.key,
      pathname: location.pathname,
    };
    dispatch({ type: navigationType, entry });
  }, [location.key, location.pathname, navigationType]);

  return (
    <NavigationHistoryContext.Provider value={{ stack }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
};

export const NavigationHistoryProvider = ({
  children,
}: {
  children: ReactNode;
}) => <InnerProvider>{children}</InnerProvider>;

export const usePreviousPage = ():
  | {
      pathname: string;
      label: string;
    }
  | undefined => {
  const { stack } = useContext(NavigationHistoryContext);
  if (stack.length < 2) return undefined;

  const previous = stack[stack.length - 2];
  if (!previous) return undefined;

  const label = getLabelForPath(previous.pathname);
  if (!label) return undefined;

  return {
    pathname: previous.pathname,
    label,
  };
};
