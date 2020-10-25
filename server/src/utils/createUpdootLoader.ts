import { Updoot } from "../entities/Updoot";
import DataLoader from "dataloader";

// [{recipeId: 5, userId: 10}]
// [{recipeId: 5, userId: 10, value: 1}]
export const createUpdootLoader = () =>
  new DataLoader<{ recipeId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);
      const updootIdsToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((updoot) => {
        updootIdsToUpdoot[`${updoot.userId}|${updoot.recipeId}`] = updoot;
      });

      return keys.map(
        (key) => updootIdsToUpdoot[`${key.userId}|${key.recipeId}`]
      );
    }
  );
