import { useLocation } from "react-router";

const useLocationState = <T extends unknown>(): T | undefined => {
  const { state } = useLocation();
  return state as T | undefined;
};

export default useLocationState;
