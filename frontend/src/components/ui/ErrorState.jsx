/** Shown when a request fails; offers a retry when the caller passes `onRetry`. */
export default function ErrorState({ message = 'Something went wrong while loading this content.', onRetry }) {
  return (
    <div className="empty-state" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="primary-btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
