import { useContext } from "react";
import { FontSizeContext, type FontSizeContextData } from "../context/FontSizeContext";

export function useFontSize(): FontSizeContextData {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error("useFontSize must be used within FontSizeProvider");
  return ctx;
}
