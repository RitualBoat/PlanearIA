import { useContext } from "react";
import { DaltonismoContext, type DaltonismoContextData } from "../context/DaltonismoContext";

export function useDaltonismo(): DaltonismoContextData {
  const ctx = useContext(DaltonismoContext);
  if (!ctx) throw new Error("useDaltonismo must be used within DaltonismoProvider");
  return ctx;
}
