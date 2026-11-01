import { create } from 'zustand';

interface AlertOptions {
  messageText: string;
  informativeText?: string;
  primaryButtonText?: string;
  cancelButtonText?: string;
  showsSuppressionButton?: boolean;
  suppressionButtonText?: string;
  onConfirm: (isSuppressed: boolean) => void;
}

interface AlertStoreState {
  isOpen: boolean;
  options: AlertOptions | null;
  showAlert: (options: AlertOptions) => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertStoreState>((set) => ({
  isOpen: false,
  options: null,
  showAlert: (options) => set({ isOpen: true, options }),
  closeAlert: () => set({ isOpen: false, options: null }),
}));

