interface ErrorStateProps {
  message?: string
}

function ErrorState({
  message = 'We could not load this data. Please try again.',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-3xl bg-red-50 p-6 text-center text-lg font-semibold text-red-800"
    >
      {message}
    </div>
  )
}

export default ErrorState
