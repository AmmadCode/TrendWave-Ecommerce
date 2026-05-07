import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-secondary/45">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
