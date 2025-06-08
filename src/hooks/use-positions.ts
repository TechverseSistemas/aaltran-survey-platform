import { Position } from '@/types/organizational';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGetPositions(companyId?: string, departmentId?: string) {
  return useQuery<Position[]>({
    queryKey: ['positions', companyId, departmentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/companies/${companyId}/departments/${departmentId}/positions`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!companyId && !!departmentId,
  });
}

export function useGetPositionById(companyId?: string, departmentId?: string, positionId?: string) {
  return useQuery<Position>({
    queryKey: ['position', companyId, departmentId, positionId],
    queryFn: async () => {
      const response = await fetch(
        `/api/companies/${companyId}/departments/${departmentId}/positions/${positionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!companyId && !!positionId && !!departmentId,
  });
}

export function useCreatePosition(companyId?: string, departmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Position, 'id'>) => {
      const response = await fetch(
        `/api/companies/${companyId}/departments/${departmentId}/positions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions', companyId] });
    },
  });
}

export function useUpdatePosition(companyId?: string, departmentId?: string, positionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Position>) => {
      const response = await fetch(
        `/api/companies/${companyId}/departments/${departmentId}/positions/${positionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['positions', companyId, departmentId],
      });
    },
  });
}

export function useDeletePosition(companyId?: string, departmentId?: string, positionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/companies/${companyId}/departments/${departmentId}/positions/${positionId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 204) {
        return null;
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['positions', companyId, departmentId],
      });
    },
  });
}
