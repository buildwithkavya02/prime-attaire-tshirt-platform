import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

/**
 * Frontend route guard — purely a UX convenience so unauthenticated users
 * don't see admin screens flash by. This is NOT real security: actual
 * authorization must be enforced by the backend on every admin API call.
 */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const { loggedIn, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-brown-dark" size={28} />
      </div>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
