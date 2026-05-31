import { Button } from "./Button";

export function DataFetchLoading({ message = "Loading data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mb-4" />
      <p className="text-cyan-300 font-medium">{message}</p>
    </div>
  );
}

export function DataFetchError({ title, message, onRetry }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="text-5xl mb-4" aria-hidden="true">
        😞
      </div>
      <p className="text-xl text-red-400 font-semibold mb-2">{title}</p>
      {message && <p className="text-white/60 mb-6 max-w-md mx-auto">{message}</p>}
      {onRetry && (
        <Button onClick={onRetry} className="bg-red-500 hover:bg-red-600 text-white">
          Try Again
        </Button>
      )}
    </div>
  );
}
