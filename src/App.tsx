import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import WhatsAppButton from "./components/layout/WhatsAppButton";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import RequestQuote from "./pages/RequestQuote";
import Contact from "./pages/Contact";

import PrivateAccessGate from "./pages/PrivateAccessGate";

import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminGuard from "./components/admin/AdminGuard";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/Projects";
import AdminProjectForm from "./pages/admin/ProjectForm";
import AdminProjectDetail from "./pages/admin/ProjectDetail";
import AdminPrivateLinks from "./pages/admin/PrivateLinks";
import AdminDesigns from "./pages/admin/Designs";
import AdminDesignDetail from "./pages/admin/DesignDetail";
import AdminProducts from "./pages/admin/Products";
import AdminProductForm from "./pages/admin/ProductForm";
import AdminSettings from "./pages/admin/Settings";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();

  // The admin-issued private design link and the admin panel are standalone
  // experiences — they never show the public marketing chrome (nav/footer/
  // WhatsApp bubble). Customization itself is private-link only; the public
  // site only ever shows product discovery pages, which keep the chrome.
  const isPrivateRoute = location.pathname.startsWith("/design/");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const showPublicChrome = !isPrivateRoute && !isAdminRoute;

  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-bg">
        <ScrollToTop />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#3E2723",
              color: "#F8F5F2",
              borderRadius: "999px",
              padding: "10px 18px",
              fontSize: "13px",
            },
          }}
        />
        {showPublicChrome && <Navbar />}
        <main>
          <Routes>
            {/* Public site */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/request-quote" element={<RequestQuote />} />
            <Route path="/contact" element={<Contact />} />

            {/* Customization is a private, admin-issued-link feature only — it is
                never publicly browsable. Any old/bookmarked "/customize" links
                are sent to the public product catalog instead of a dead route. */}
            <Route path="/customize" element={<Navigate to="/products" replace />} />
            <Route path="/customize/:productSlug" element={<Navigate to="/products" replace />} />

            {/* Private customer design studio — access only via admin-issued link */}
            <Route path="/design/:token" element={<PrivateAccessGate />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <AdminGuard>
                  <AdminProjects />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/projects/new"
              element={
                <AdminGuard>
                  <AdminProjectForm />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/projects/:id"
              element={
                <AdminGuard>
                  <AdminProjectDetail />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/projects/:id/edit"
              element={
                <AdminGuard>
                  <AdminProjectForm />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/private-links"
              element={
                <AdminGuard>
                  <AdminPrivateLinks />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/designs"
              element={
                <AdminGuard>
                  <AdminDesigns />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/designs/:id"
              element={
                <AdminGuard>
                  <AdminDesignDetail />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminGuard>
                  <AdminProducts />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <AdminGuard>
                  <AdminProductForm />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <AdminGuard>
                  <AdminProductForm />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminGuard>
                  <AdminSettings />
                </AdminGuard>
              }
            />
          </Routes>
        </main>
        {showPublicChrome && <Footer />}
        {showPublicChrome && <WhatsAppButton />}
      </div>
    </AdminAuthProvider>
  );
}
