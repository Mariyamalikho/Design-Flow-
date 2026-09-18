import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-6xl font-bold text-zinc-900 mb-4">404</h1>
      <p className="text-zinc-500 mb-8">Page not found</p>
      <Link to="/" className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800">
        Go Home
      </Link>
    </div>
  );
}
