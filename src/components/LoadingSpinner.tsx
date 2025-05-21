export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      <p className="ml-4 text-lg text-foreground">Generating your recipe...</p>
    </div>
  );
}
