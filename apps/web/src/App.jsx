import { NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/auth-context.jsx";
import { AboutPage, ContactPage, DashboardPage, Footer, HomePage, LoginPage, OAuthCallbackPage, PrivacyPage, RegisterPage, ProtectedRoute, TermsPage } from "./pages.jsx";

function Nav() {
  const { isAuthenticated, logout } = useAuth();
  const navLinkClass = ({ isActive }, base) => `${base}${isActive ? " active" : ""}`;

  return (
    <header className="app-header sticky">
      <div className="main-header-container container-fluid d-flex align-items-center justify-content-between">
        <div className="header-content-left d-flex align-items-center gap-2">
          <h1 className="fs-18 mb-0">Sukalp SaaS</h1>
          <span className="badge bg-primary-transparent">Enterprise Console</span>
        </div>
        <nav className="btn-list" aria-label="Main navigation">
          <NavLink to="/" className={(state) => navLinkClass(state, "btn btn-light btn-wave nav-btn d-inline-flex align-items-center gap-2")}><i className="ri-home-4-line"></i> Home</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/app" className={(state) => navLinkClass(state, "btn btn-primary btn-wave nav-btn d-inline-flex align-items-center gap-2")}><i className="ri-dashboard-line"></i> Dashboard</NavLink>
              <button type="button" onClick={logout} className="btn btn-light btn-wave nav-btn d-inline-flex align-items-center gap-2">
                <i className="ri-logout-box-line"></i> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={(state) => navLinkClass(state, "btn btn-light btn-wave nav-btn d-inline-flex align-items-center gap-2")}><i className="ri-login-box-line"></i> Login</NavLink>
              <NavLink to="/register" className={(state) => navLinkClass(state, "btn btn-primary btn-wave nav-btn d-inline-flex align-items-center gap-2")}><i className="ri-user-add-line"></i> Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="page">
      <Nav />

      <main className="main-content app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/:section"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
