/**
 * useMe.ts
 * The logged-in user's profile from the ['me'] cache, loaded at start-up (api-integration.md 6.5).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { profileApi } from "../api/profile";
import type { OwnProfile } from "../api/types";
import { keys } from "../session/queryClient";

/**
 * The own profile.
 * @returns The query; data is normally already cached.
 */
export function useMe(): UseQueryResult<OwnProfile> {
  return useQuery({ queryKey: keys.me, queryFn: profileApi.getMe });
}
