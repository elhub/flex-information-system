import { useLocation } from "react-router";

const useLocationState = <T>(): T | undefined => {
  const { state } = useLocation();
  return state as T | undefined;
};

export default useLocationState;
