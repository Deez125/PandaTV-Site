export default function Wordmark({ className = '' }) {
  return (
    <span className={`wordmark ${className}`}>
      novix<span className="wordmark-dot">.</span>tv
    </span>
  );
}
