"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm font-medium text-slate-900">Algo deu errado.</p>
      <p className="max-w-sm text-sm text-slate-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Tentar de novo
      </button>
    </div>
  );
}
