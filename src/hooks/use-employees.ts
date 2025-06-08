import { employeeCreateSchema, employeeUpdateSchema } from '@/schemas/employee';
import { Employee } from '@/types/employees';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import z from 'zod';

export function useGetEmployees(companyId?: string) {
  return useQuery<Employee[]>({
    queryKey: ['employees', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${companyId}/employees`, {
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

export function useGetEmployeeById(employeeId: string, companyId?: string) {
  return useQuery<Employee>({
    queryKey: ['employee', companyId, employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${companyId}/employees/${employeeId}`, {
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

export function useCreateEmployee(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: z.infer<typeof employeeCreateSchema>) => {
      const response = await fetch(`/api/companies/${companyId}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
    },
  });
}

export function useUpdateEmployee(companyId?: string, employeeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: z.infer<typeof employeeUpdateSchema>) => {
      const response = await fetch(`/api/companies/${companyId}/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
    },
  });
}

export function useDeleteEmployee(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await fetch(`/api/companies/${companyId}/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
    },
  });
}
