import { CompanyFormData } from '@/schemas/companies';
import { Company } from '@/types/companies';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGetCompaniesQuery() {
  return useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: CompanyFormData) => {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Erro ao cadastrar empresa: ${errorData.msgRet}`);
        return;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}
