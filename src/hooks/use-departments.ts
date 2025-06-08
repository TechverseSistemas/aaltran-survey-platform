import { Department } from '@/types/organizational';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGetDepartments(companyId?: string) {
  return useQuery<Department[]>({
    queryKey: ['departments', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${companyId}/departments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!companyId,
  });
}

export function useGetDepartmentById(companyId: string, departmentId: string) {
  return useQuery<Department>({
    queryKey: ['department', companyId, departmentId],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${companyId}/departments/${departmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!companyId && !!departmentId,
  });
}

export function useCreateDepartment(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Department, 'id'>) => {
      const response = await fetch(`/api/companies/${companyId}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', companyId] });
    },
  });
}

export function useUpdateDepartment(companyId?: string, departmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Department, 'id'>) => {
      const response = await fetch(`/api/companies/${companyId}/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', companyId] });
    },
  });
}

export function useDeleteDepartment(companyId?: string, departmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/companies/${companyId}/departments/${departmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        return null;
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', companyId] });
    },
  });
}
