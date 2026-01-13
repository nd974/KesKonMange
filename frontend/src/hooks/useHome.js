import { useMutation, useQuery } from "@tanstack/react-query";
import { loginHome, createHome, searchAddress  } from "../api/home.api";

export function useLoginHome() {
  return useMutation({
    mutationFn: loginHome,
  });
}

export function useCreateHome() {
  return useMutation({
    mutationFn: createHome,
  });
}


export function useAddressSearch(query) {
  return useQuery({
    queryKey: ["address-search", query],
    queryFn: () => searchAddress(query),
    enabled: !!query && query.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: false,
  });
}