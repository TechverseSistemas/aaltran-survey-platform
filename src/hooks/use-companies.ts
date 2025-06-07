import { Company } from '@/types/companies';
import { useQuery } from '@tanstack/react-query';

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
