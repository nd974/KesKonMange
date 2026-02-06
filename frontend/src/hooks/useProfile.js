import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProfileApi, transferProfileApi, getProfilesByHome, updateProfilePinApi } from "../api/profile.api";

export function useGetProfiles(homeId) {
  return useQuery({
    queryKey: ["profiles", homeId],
    enabled: !!homeId,
    queryFn: () => getProfilesByHome(homeId),
  });
}

export function useCreateProfile(homeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", homeId] });
    },
  });
}

export function useTransferProfile(homeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transferProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", homeId] });
    },
  });
}

export function useUpdateProfilePin(homeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfilePinApi,
    onSuccess: () => {
      // 🔄 refresh profils (PIN changé)
      queryClient.invalidateQueries({ queryKey: ["profiles", homeId] });
    },
  });
}