type ToastKind = "info" | "success" | "error";

type Listener = (message: string, kind: ToastKind) => void;

const listeners = new Set<Listener>();

export function onToast(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit(message: string, kind: ToastKind) {
  for (const fn of listeners) fn(message, kind);
}

export const toast = {
  info: (message: string) => emit(message, "info"),
  success: (message: string) => emit(message, "success"),
  error: (message: string) => emit(message, "error"),
};
