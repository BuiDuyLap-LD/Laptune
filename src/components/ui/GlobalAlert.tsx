'use client';

import React from 'react';
import { useAlertStore } from '@/stores/useAlertStore';
import NSAlert from './NSAlert';

export default function GlobalAlert() {
  const { isOpen, options, closeAlert } = useAlertStore();

  if (!isOpen || !options) return null;

  return (
    <NSAlert
      isOpen={isOpen}
      onClose={closeAlert}
      messageText={options.messageText}
      informativeText={options.informativeText}
      primaryButtonText={options.primaryButtonText}
      cancelButtonText={options.cancelButtonText}
      showsSuppressionButton={options.showsSuppressionButton}
      suppressionButtonText={options.suppressionButtonText}
      onConfirm={(isSuppressed) => {
        closeAlert();
        options.onConfirm(isSuppressed);
      }}
    />
  );
}

