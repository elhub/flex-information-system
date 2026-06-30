import { useLocation } from "react-router-dom";

const useLocationState = <T>(): T | undefined => {
  const { state } = useLocation();
  return state as T | undefined;
};

export default useLocationState;
