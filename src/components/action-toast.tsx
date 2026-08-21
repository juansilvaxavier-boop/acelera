"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function ActionToast({
  error,
  success,
  successMessage = "Salvo com sucesso.",
}: {
  error?: string;
  success?: boolean;
  successMessage?: string;
}) {
  const ultimoErro = useRef<string | undefined>(undefined);
  const ultimoSucesso = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (error && error !== ultimoErro.current) toast.error(error);
    ultimoErro.current = error;
  }, [error]);

  useEffect(() => {
    if (success && success !== ultimoSucesso.current) toast.success(successMessage);
    ultimoSucesso.current = success;
  }, [success, successMessage]);

  return null;
}
