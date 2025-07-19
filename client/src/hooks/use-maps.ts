import { useQuery } from '@tanstack/react-query';
import { WorldMap } from '@shared/schema';

export function useMaps() {
  return useQuery<WorldMap[]>({
    queryKey: ['/api/maps'],
    queryFn: async () => {
      const response = await fetch('/api/maps');
      if (!response.ok) {
        throw new Error('Failed to fetch maps');
      }
      return response.json();
    }
  });
}

export function useMap(id: number) {
  return useQuery<WorldMap>({
    queryKey: ['/api/maps', id],
    queryFn: async () => {
      const response = await fetch(`/api/maps/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch map');
      }
      return response.json();
    },
    enabled: !!id
  });
}

export function useMapByCode(code: string) {
  return useQuery<WorldMap>({
    queryKey: ['/api/maps/code', code],
    queryFn: async () => {
      const response = await fetch(`/api/maps/code/${code}`);
      if (!response.ok) {
        throw new Error('Failed to fetch map');
      }
      return response.json();
    },
    enabled: !!code
  });
}