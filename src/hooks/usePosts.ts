import { useContext } from "react";
import { PostsContext, type PostsContextData } from "../context/PostsContext";

export function usePosts(): PostsContextData {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within PostsProvider");
  return ctx;
}
