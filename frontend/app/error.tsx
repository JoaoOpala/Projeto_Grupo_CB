"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Algo deu errado</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "Ocorreu um erro inesperado."}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
