import { Platform } from "react-native";
import { createClassroomRepository, type ClassroomRepository } from "./classroomRepository";
import { classroomStorage } from "./classroomStorage";
import { openClassroomSQLiteStorage } from "./sqlite/classroomSqliteStorage";

export type ClassroomRepositoryMode = "async-storage" | "sqlite";

export async function createClassroomRepositoryForMode(
  mode: ClassroomRepositoryMode = "async-storage",
): Promise<ClassroomRepository> {
  if (mode === "sqlite" && Platform.OS !== "web") {
    const storage = await openClassroomSQLiteStorage();
    return createClassroomRepository(storage);
  }

  return createClassroomRepository(classroomStorage);
}
