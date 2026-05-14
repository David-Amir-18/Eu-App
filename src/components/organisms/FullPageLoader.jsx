export default function FullPageLoader() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface-page gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-text-action"></div>
      <p className="text-body-md font-semibold text-text-headings animate-pulse">
        Authenticating...
      </p>
    </div>
  )
}