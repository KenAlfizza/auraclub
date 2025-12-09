export function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">401 – Unauthorized</h1>
      <p className="text-lg mb-6">You do not have permission to access this page.</p>
      <a href="/dashboard" className="text-blue-500 underline">
        Return to Dashboard
      </a>
    </div>
  );
}
