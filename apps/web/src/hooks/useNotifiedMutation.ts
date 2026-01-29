import { dismissLoading, showError, showLoading } from '@/lib/toast';
import { useMutation } from '@tanstack/react-query';

interface NotifiedMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  loadingMessage?: string;
  successMessage?: string | ((data: TData) => string);
  errorMessage?: string | ((error: Error) => string);
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export function useNotifiedMutation<TData = unknown, TVariables = void>({
  mutationFn,
  loadingMessage = 'Procesando...',
  successMessage = 'Operación completada',
  errorMessage = 'Ha ocurrido un error',
  onSuccess,
  onError,
}: NotifiedMutationOptions<TData, TVariables>) {
  let toastId: string | number | undefined;

  return useMutation({
    mutationFn,
    onMutate: () => {
      toastId = showLoading(loadingMessage);
    },
    onSuccess: (data, variables) => {
      const message = typeof successMessage === 'function' ? successMessage(data) : successMessage;
      if (toastId) {
        dismissLoading(toastId, message);
      }
      onSuccess?.(data, variables);
    },
    onError: (error: Error, variables) => {
      if (toastId) {
        dismissLoading(toastId);
      }
      const message = typeof errorMessage === 'function' ? errorMessage(error) : errorMessage;
      showError(message, error.message);
      onError?.(error, variables);
    },
  });
}
