import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Page not found</h2>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 px-6 py-2.5 text-white font-medium text-sm transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
