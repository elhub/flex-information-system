import { useLocation } from "react-router-dom";

const useLocationState = <T>() => {
  const { state } = useLocation();
  return state as T;
};

export default useLocationState;
