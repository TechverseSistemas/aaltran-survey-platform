import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useImportXml() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/import/employees`, {
        method: 'POST',
        body: data,
      });

      return response.json();
    },
    onSuccess: () => {
      console.log('Funcionários importados com sucesso');
    },
  });
}
