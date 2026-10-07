/**
 * useFavorites.ts
 * One favorites set for the whole app (api-integration.md 6.9). A star tap updates the set at once,
 * then calls the API; a failure rolls back with a toast.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { favoritesApi } from "../api/favorites";
import { useToast } from "../components/Toast";
import { keys } from "../session/queryClient";

/** What useFavorites returns. */
export interface Favorites {
  favorites: ReadonlySet<string>;
  isFavorite: (userId: string) => boolean;
  /** Adds or removes a favorite. */
  toggle: (userId: string) => void;
}

/**
 * The favorites set and its toggle.
 * @returns The favorites.
 */
export function useFavorites(): Favorites {
  const queryClient = useQueryClient();
  const toast = useToast();
  const query = useQuery({ queryKey: keys.favorites, queryFn: favoritesApi.getFavorites });
  const favorites = useMemo(() => new Set(query.data ?? []), [query.data]);

  const mutation = useMutation({
    mutationFn: async ({ userId, add }: { userId: string; add: boolean }) => {
      if (add) {
        await favoritesApi.add(userId);
      } else {
        await favoritesApi.remove(userId);
      }
    },
    onMutate: async ({ userId, add }) => {
      await queryClient.cancelQueries({ queryKey: keys.favorites });
      const before = queryClient.getQueryData<string[]>(keys.favorites) ?? [];
      const next = add ? [...new Set([...before, userId])] : before.filter((id) => id !== userId);
      queryClient.setQueryData(keys.favorites, next);
      return { before };
    },
    onError: (_error, _vars, context) => {
      queryClient.setQueryData(keys.favorites, context?.before ?? []);
      toast.show("Couldn't update favorites. Try again.");
    },
    onSettled: (_data, _error, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: keys.conversations });
      void queryClient.invalidateQueries({ queryKey: keys.user(userId) });
    },
  });

  return {
    favorites,
    isFavorite: (userId) => favorites.has(userId),
    toggle: (userId) => mutation.mutate({ userId, add: !favorites.has(userId) }),
  };
}
