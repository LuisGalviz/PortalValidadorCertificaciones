import { toast } from 'sonner';

const DEFAULT_DURATION = 5000;

export function showSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: DEFAULT_DURATION,
  });
}

export function showError(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: DEFAULT_DURATION,
  });
}

export function showWarning(message: string, description?: string) {
  toast.warning(message, {
    description,
    duration: DEFAULT_DURATION,
  });
}

export function showInfo(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: DEFAULT_DURATION,
  });
}

export function showLoading(message = 'Guardando información...') {
  return toast.loading(message);
}

export function dismissLoading(toastId: string | number, message?: string) {
  if (message) {
    toast.success(message, { id: toastId, duration: DEFAULT_DURATION });
  } else {
    toast.dismiss(toastId);
  }
}

export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
}

export function showConfirm(
  message: string,
  options: {
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }
) {
  toast(message, {
    description: options.description,
    duration: Number.POSITIVE_INFINITY,
    action: {
      label: options.confirmText || 'Confirmar',
      onClick: options.onConfirm,
    },
    cancel: {
      label: options.cancelText || 'Cancelar',
      onClick: options.onCancel,
    },
  });
}

export function dismissAll() {
  toast.dismiss();
}

export { toast };
