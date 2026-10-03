export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="page-loader" role="status">
      <span className="loader-dot"></span>
      <span className="loader-dot"></span>
      <span className="loader-dot"></span>
      <span className="sr-only">{label}</span>
    </div>
  )
}
