import { useMutation, useQuery, useQueryClient  } from "@tanstack/react-query";
import {
  checkSubscription,
  getSubscribers,
  subscribeMenu,
  unsubscribeMenu,
  deleteMenu,
  updateRecipeCount,
  getMenusByHome
} from "../api/menu.api";
import dayjs from "dayjs";

export function useSubscription(menuId, profileId) {
  return useQuery({
    queryKey: ["subscription", menuId, profileId],
    queryFn: () => checkSubscription({ menuId, profileId }),
    enabled: !!menuId && !!profileId,
  });
}

export function useSubscribers(menuId, enabled) {
  return useQuery({
    queryKey: ["subscribers", menuId],
    queryFn: () => getSubscribers(menuId),
    enabled: !!menuId && enabled,
  });
}

export function useToggleSubscription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuId, profileId, subscribed }) => {
      return subscribed
        ? unsubscribeMenu({ menuId, profileId })
        : subscribeMenu({ menuId, profileId });
    },
    onSuccess: (_, { menuId, profileId }) => {
      qc.invalidateQueries(["subscription", menuId, profileId]);
    },
  });
}

export function useDeleteMenu() {
  return useMutation({
    mutationFn: deleteMenu,
  });
}

export function useUpdateRecipeCount() {
  return useMutation({
    mutationFn: updateRecipeCount,
  });
}

export function useMenusByHome(homeId) {
  return useQuery({
    queryKey: ["menus", homeId],
    enabled: !!homeId,
    queryFn: async () => {
      const data = await getMenusByHome(homeId);

      return data
        .map((m) => ({
          id: m.id,
          date: dayjs(m.date).format("YYYY-MM-DD"),
          tagName: m.tag ? m.tag.name : null,
          recipes: m.recipes || [],
        }))
        .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
    },
  });
}