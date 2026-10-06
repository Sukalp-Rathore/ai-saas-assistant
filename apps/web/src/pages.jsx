import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link, NavLink, useParams } from "react-router-dom";
import { useAuth } from "./contexts/auth-context.jsx";
import { useToast } from "./contexts/toast-context.jsx";
import { api, API_URL, setAccessToken, getAccessToken } from "./lib/api.js";

function ConfirmModal({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", busy, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="confirm-title" style={{ background: "rgba(2, 6, 23, 0.6)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="confirm-title">{title}</h5>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={onCancel} disabled={busy}>
            {cancelLabel}
            </button>
            <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={busy}>
            {busy ? "Processing..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({ rows = 2 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, idx) => (
        <p key={idx} className="placeholder-glow mb-2">
          <span className="placeholder col-12" style={{ height: "2.4rem", borderRadius: "0.5rem" }} />
        </p>
      ))}
    </div>
  );
}

export function HomePage() {
  return (
    <section className="container py-5">
      <div className="card custom-card overflow-hidden">
        <div className="card-body text-center p-5">
          <span className="avatar avatar-lg bg-primary-transparent mb-3">
            <i className="ri-rocket-line fs-24"></i>
          </span>
          <h2 className="mb-2">Sukalp SaaS</h2>
          <p className="text-muted mb-4">AI-powered workspaces, API keys, reports, and analytics in one enterprise dashboard.</p>
          <div className="btn-list justify-content-center">
            <Link to="/register" className="btn btn-primary btn-wave">Get Started</Link>
            <Link to="/login" className="btn btn-light btn-wave">Sign In</Link>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-4">
        <div className="col-12 col-md-4">
          <div className="card custom-card text-center p-4">
            <span className="avatar avatar-md bg-info-transparent mx-auto mb-2">
              <i className="ri-database-2-line fs-20"></i>
            </span>
            <h5 className="h6">Multi-Database Workspaces</h5>
            <p className="text-muted fs-12 mb-0">Connect MySQL, PostgreSQL, MongoDB, and SQLite.</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card custom-card text-center p-4">
            <span className="avatar avatar-md bg-success-transparent mx-auto mb-2">
              <i className="ri-key-2-line fs-20"></i>
            </span>
            <h5 className="h6">Scoped API Keys</h5>
            <p className="text-muted fs-12 mb-0">Generate keys per workspace with usage tracking.</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card custom-card text-center p-4">
            <span className="avatar avatar-md bg-warning-transparent mx-auto mb-2">
              <i className="ri-bar-chart-box-line fs-20"></i>
            </span>
            <h5 className="h6">Analytics & Reports</h5>
            <p className="text-muted fs-12 mb-0">Track usage, quotas, and generate AI reports.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setFieldError("");

    if (mode === "register" && form.name.trim().length < 2) {
      setFieldError("Name must be at least 2 characters");
      return;
    }

    if (!form.email.includes("@")) {
      setFieldError("Enter a valid email address");
      return;
    }
    if (form.password.length < 8) {
      setFieldError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
      }
      toast.success(mode === "register" ? "Account created successfully" : "Welcome back");
      navigate("/app");
    } catch (err) {
      const message = err.message || "Authentication failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card custom-card p-4">
      <h2>{mode === "register" ? "Create Account" : "Sign In"}</h2>
      <p className="mb-3 text-muted fw-normal">
        {mode === "register"
          ? "Create your organization workspace and start managing keys securely."
          : "Access your organization dashboard and continue operations."}
      </p>
      {error && <p className="alert alert-danger mb-2">{error}</p>}
      {fieldError && <p className="alert alert-warning mb-2">{fieldError}</p>}
      {mode === "register" && (
        <label>
          Name
          <input
            className="form-control"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
      )}
      <label>
        Email
        <input
          className="form-control"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </label>
      <label>
        Password
        <input
          className="form-control"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </label>
      <button type="submit" className="btn btn-primary btn-wave w-100">
        {isSubmitting ? "Please wait..." : mode === "register" ? "Register" : "Login"}
      </button>
      <div className="d-flex align-items-center gap-2 my-3">
        <hr className="flex-fill" />
        <span className="text-muted fs-12">or</span>
        <hr className="flex-fill" />
      </div>
      <a
        href={`${API_URL}/auth/google`}
        className="btn btn-light btn-wave w-100 d-flex align-items-center justify-content-center gap-2"
      >
        <i className="ri-google-fill"></i>
        <span>Continue with Google</span>
      </a>
      <p className="text-center mt-3 mb-0">
        {mode === "register" ? (
          <>
            Already have an account? <Link className="text-primary" to="/login">Login</Link>
          </>
        ) : (
          <>
            No account? <Link className="text-primary" to="/register">Register</Link>
          </>
        )}
      </p>
    </form>
  );
}

export function LoginPage() {
  return <div className="container py-5"><div className="row justify-content-center"><div className="col-12 col-sm-10 col-md-8 col-lg-5"><AuthForm mode="login" /></div></div></div>;
}

export function RegisterPage() {
  return <div className="container py-5"><div className="row justify-content-center"><div className="col-12 col-sm-10 col-md-8 col-lg-5"><AuthForm mode="register" /></div></div></div>;
}

export function OAuthCallbackPage() {
  const { refreshSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    if (accessToken) {
      setAccessToken(accessToken);
    }
    refreshSession()
      .then(() => {
        toast.success("Signed in with Google");
        navigate("/app");
      })
      .catch(() => {
        toast.error("Google sign-in failed");
        navigate("/login?error=oauth");
      });
  }, [navigate, refreshSession, toast]);

  return (
    <div className="container py-5 text-center">
      <p>Completing Google sign-in...</p>
    </div>
  );
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { section } = useParams();
  const toast = useToast();
  const [org, setOrg] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [apiKeyToken, setApiKeyToken] = useState("");
  const [widgetApiKey, setWidgetApiKey] = useState("");
  const [widgetQuestion, setWidgetQuestion] = useState("");
  const [widgetAnswer, setWidgetAnswer] = useState("");
  const [widgetEmbedCode, setWidgetEmbedCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [confirmState, setConfirmState] = useState(null);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    databaseType: "mysql",
    databaseConfig: JSON.stringify({ host: "localhost", port: 3306, database: "" }),
  });
  const [testConnectionCollections, setTestConnectionCollections] = useState([]);

  const [newApiKey, setNewApiKey] = useState({
    name: "",
    workspaceId: "",
  });
  const [newInvite, setNewInvite] = useState({ email: "", role: "member" });
  const [inviteToken, setInviteToken] = useState("");
  const [orgSettings, setOrgSettings] = useState({ name: "" });
  const [profileSettings, setProfileSettings] = useState({ name: "", password: "" });
  const [newReport, setNewReport] = useState({
    name: "",
    template: "custom",
    format: "json",
    prompt: "",
    workspaceId: "",
  });
  const [viewingReport, setViewingReport] = useState(null);

  async function loadData(silent = false) {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      const [orgRes, wsRes, teamRes, inviteRes, keyRes, reportRes, analyticsRes, subscriptionRes] = await Promise.all([
        api.get("/organizations"),
        api.get("/workspaces"),
        api.get("/teams"),
        api.get("/teams/invites"),
        api.get("/api-keys"),
        api.get("/reports"),
        api.get("/analytics").catch(() => ({ data: null })),
        api.get("/subscriptions").catch(() => ({ data: null })),
      ]);
      setOrg(orgRes.data);
      setWorkspaces(wsRes.data);
      setMembers(teamRes.data);
      setInvitations(inviteRes.data);
      setApiKeys(keyRes.data);
      setReports(reportRes.data);
      setAnalytics(analyticsRes.data);
      setSubscription(subscriptionRes.data);
    } catch (err) {
      const message = err.message || "Failed to load dashboard";
      setError(message);
      toast.error(message);
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (org) {
      setOrgSettings((prev) => ({ ...prev, name: org.name || "" }));
    }
  }, [org?.name]);

  useEffect(() => {
    if (user) {
      setProfileSettings((prev) => ({ ...prev, name: user.name || "" }));
    }
  }, [user?.name]);

  useEffect(() => {
    if (apiKeyToken) {
      setWidgetApiKey(apiKeyToken);
    }
  }, [apiKeyToken]);

  useEffect(() => {
    const snippet = `<!-- Sukalp AI Widget -->
<div id="sukalp-widget-root"></div>
<script>
(function(){
  const API_URL = "${API_URL}/public/chat";
  const API_KEY = "${widgetApiKey || "REPLACE_WITH_API_KEY"}";

  const root = document.getElementById("sukalp-widget-root");
  root.innerHTML = \`
<div style="position:fixed;right:20px;bottom:20px;width:320px;max-width:calc(100vw - 24px);background:#0f172a;border:1px solid #334155;border-radius:14px;box-shadow:0 20px 35px rgba(2,6,23,.35);font-family:Space Grotesk,Segoe UI,sans-serif;z-index:9999;overflow:hidden">
  <div style="padding:12px 14px;background:#06b6d4;color:#062032;font-weight:700">Sukalp Assistant</div>
  <div id="sukalp-widget-messages" style="height:220px;overflow:auto;padding:12px;color:#e2e8f0;font-size:14px;background:#0b1327"></div>
  <form id="sukalp-widget-form" style="display:flex;border-top:1px solid #334155">
    <input id="sukalp-widget-input" placeholder="Ask a question" style="flex:1;border:0;background:#0f172a;color:#e2e8f0;padding:10px;outline:none" />
    <button style="border:0;background:#06b6d4;color:#062032;padding:0 14px;font-weight:600;cursor:pointer">Send</button>
  </form>
</div>\`;

  const messages = document.getElementById("sukalp-widget-messages");
  const form = document.getElementById("sukalp-widget-form");
  const input = document.getElementById("sukalp-widget-input");

  function addMessage(role, text) {
    const node = document.createElement("p");
    node.style.margin = "0 0 10px";
    const title = role === "user" ? "You" : "Bot";
    const color = role === "user" ? "#22d3ee" : "#34d399";
    node.innerHTML = '<strong style="color:' + color + '">' + title + ':</strong> ' + text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
  }

  form.addEventListener("submit", async function(e){
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    addMessage("user", question);
    input.value = "";
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({ question })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Request failed");
      addMessage("assistant", json.data?.answer || "No answer returned");
    } catch (err) {
      addMessage("assistant", "Error: " + err.message);
    }
  });
})();
<\/script>`;
    setWidgetEmbedCode(snippet);
  }, [widgetApiKey]);

  async function handleCreateWorkspace(e) {
    e.preventDefault();
    if (busyAction) return;
    setBusyAction("create-workspace");
    setError("");
    setFieldError("");
    try {
      if (newWorkspace.name.trim().length < 2) {
        throw new Error("Workspace name must be at least 2 characters");
      }
      const config = JSON.parse(newWorkspace.databaseConfig);
      await api.post("/workspaces", { ...newWorkspace, databaseConfig: config });
      setNewWorkspace({
        name: "",
        databaseType: "mysql",
        databaseConfig: JSON.stringify({ host: "localhost", port: 3306, database: "" }),
      });
      toast.success("Workspace created");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to create workspace";
      setFieldError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleTestConnection() {
    if (busyAction) return;
    setBusyAction("test-connection");
    setError("");
    setFieldError("");
    setTestConnectionCollections([]);
    try {
      const config = JSON.parse(newWorkspace.databaseConfig);
      const res = await api.post("/workspaces/test-connection", {
        databaseType: newWorkspace.databaseType,
        databaseConfig: config,
      });
      if (res.success) {
        setTestConnectionCollections(res.collections || []);
        toast.success(res.message || "Connection successful");
      } else {
        throw new Error(res.message || "Connection test failed");
      }
    } catch (err) {
      const message = err.message || "Connection test failed";
      setFieldError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleCreateApiKey(e) {
    e.preventDefault();
    if (busyAction) return;
    setBusyAction("create-api-key");
    setError("");
    setFieldError("");
    setApiKeyToken("");
    try {
      if (newApiKey.name.trim().length < 3) {
        throw new Error("API key name must be at least 3 characters");
      }
      const res = await api.post("/api-keys", {
        name: newApiKey.name,
        workspaceId: newApiKey.workspaceId || undefined,
      });
      setApiKeyToken(res.data.key);
      setNewApiKey({ name: "", workspaceId: "" });
      toast.success("API key created. Copy it now.");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to create API key";
      setFieldError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleTestWidgetChat(e) {
    e.preventDefault();
    if (busyAction) return;
    setError("");
    setFieldError("");
    if (!widgetApiKey.trim()) {
      const message = "Add an API key to test the widget chat";
      setFieldError(message);
      toast.error(message);
      return;
    }
    if (!widgetQuestion.trim()) {
      const message = "Enter a question for widget testing";
      setFieldError(message);
      toast.error(message);
      return;
    }

    setBusyAction("test-widget");
    try {
      const response = await fetch(`${API_URL}/public/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": widgetApiKey.trim(),
        },
        body: JSON.stringify({ question: widgetQuestion.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Widget test failed");
      }
      const answer = data.data?.answer || "No answer returned";
      setWidgetAnswer(answer);
      toast.success("Widget test successful");
    } catch (err) {
      const message = err.message || "Widget test failed";
      setFieldError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleCopyWidgetCode() {
    if (!widgetEmbedCode) return;
    try {
      await navigator.clipboard.writeText(widgetEmbedCode);
      toast.success("Widget code copied");
    } catch {
      toast.error("Failed to copy widget code");
    }
  }

  async function handleDeleteWorkspace(workspaceId) {
    if (busyAction) return;
    setBusyAction(`delete-workspace-${workspaceId}`);
    setError("");
    try {
      await api.del(`/workspaces/${workspaceId}`);
      toast.success("Workspace deleted");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to delete workspace";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
      setConfirmState(null);
    }
  }

  async function handleUpdateMemberRole(memberId, role) {
    if (busyAction) return;
    setBusyAction(`update-role-${memberId}`);
    setError("");
    try {
      await api.put(`/teams/${memberId}`, { role });
      toast.success(`Member role changed to ${role}`);
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to update member role";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleInviteMember(e) {
    e.preventDefault();
    if (busyAction) return;
    setBusyAction("invite-member");
    setError("");
    setFieldError("");
    try {
      if (!newInvite.email.includes("@")) {
        throw new Error("Enter a valid invite email");
      }
      await api.post("/teams/invites", newInvite);
      setNewInvite({ email: "", role: "member" });
      toast.success("Invitation sent");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to send invitation";
      setFieldError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleRevokeInvite(inviteId) {
    if (busyAction) return;
    setBusyAction(`revoke-invite-${inviteId}`);
    setError("");
    try {
      await api.put(`/teams/invites/${inviteId}/revoke`);
      toast.success("Invitation revoked");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to revoke invitation";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleAcceptInviteToken(e) {
    e.preventDefault();
    if (busyAction) return;
    setBusyAction("accept-invite");
    setError("");
    setFieldError("");
    try {
      if (!inviteToken.trim()) {
        throw new Error("Invitation token is required");
      }
      await api.post("/teams/accept-invite", { token: inviteToken.trim() });
      setInviteToken("");
      toast.success("Invitation accepted");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to accept invitation";
      setFieldError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleRemoveMember(memberId) {
    if (busyAction) return;
    setBusyAction(`remove-member-${memberId}`);
    setError("");
    try {
      await api.del(`/teams/${memberId}`);
      toast.success("Member removed");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to remove member";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
      setConfirmState(null);
    }
  }

  async function handleUpdateOrganization(e) {
    e.preventDefault();
    if (busyAction) return;
    setBusyAction("update-organization");
    setError("");
    setFieldError("");
    try {
      if (!orgSettings.name.trim() || orgSettings.name.trim().length < 2) {
        throw new Error("Organization name must be at least 2 characters");
      }
      await api.put("/organizations", { name: orgSettings.name.trim() });
      toast.success("Organization updated");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to update organization";
      setFieldError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleUpdateOrganizationLogo(file) {
    if (!file || busyAction) return;
    setBusyAction("update-logo");
    setError("");
    setFieldError("");
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      if (!base64.startsWith("data:image/")) {
        throw new Error("Please upload a valid image file");
      }
      await api.post("/organizations/logo", { logo: base64 });
      toast.success("Organization logo updated");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to update logo";
      setFieldError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleDeleteOrganizationLogo() {
    if (busyAction) return;
    setBusyAction("delete-logo");
    setError("");
    try {
      await api.del("/organizations/logo");
      toast.success("Organization logo removed");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to delete logo";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (busyAction) return;
    setBusyAction("update-profile");
    setError("");
    setFieldError("");
    try {
      const payload = {};
      if (profileSettings.name.trim().length >= 2) {
        payload.name = profileSettings.name.trim();
      }
      if (profileSettings.password && profileSettings.password.length >= 8) {
        payload.password = profileSettings.password;
      }
      if (Object.keys(payload).length === 0) {
        throw new Error("No changes to save");
      }
      await api.put("/auth/profile", payload);
      toast.success("Profile updated");
      setProfileSettings((prev) => ({ ...prev, password: "" }));
      await refreshSession?.();
    } catch (err) {
      const message = err.message || "Failed to update profile";
      setFieldError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleToggleApiKey(key) {
    if (busyAction) return;
    setBusyAction(`toggle-key-${key._id}`);
    setError("");
    try {
      await api.put(`/api-keys/${key._id}`, { isActive: !key.isActive });
      toast.success(`API key ${key.isActive ? "disabled" : "enabled"}`);
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to update API key";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleRegenerateApiKey(apiKeyId) {
    if (busyAction) return;
    setBusyAction(`regenerate-key-${apiKeyId}`);
    setError("");
    setApiKeyToken("");
    try {
      const res = await api.post(`/api-keys/${apiKeyId}/regenerate`);
      setApiKeyToken(res.data.key);
      toast.success("API key regenerated. Copy the new key now.");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to regenerate API key";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
      setConfirmState(null);
    }
  }

  async function handleDeleteApiKey(apiKeyId) {
    if (busyAction) return;
    setBusyAction(`delete-key-${apiKeyId}`);
    setError("");
    try {
      await api.del(`/api-keys/${apiKeyId}`);
      toast.success("API key deleted");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to delete API key";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
      setConfirmState(null);
    }
  }

  async function handleUpgradePlan(planId) {
    if (busyAction) return;
    setBusyAction(`upgrade-plan-${planId}`);
    setError("");
    try {
      await api.post("/subscriptions/upgrade", { planId });
      toast.success(`Plan upgraded to ${planId}`);
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to upgrade plan";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleCreateReport(e) {
    e.preventDefault();
    if (busyAction) return;
    setBusyAction("create-report");
    setError("");
    setFieldError("");
    try {
      if (newReport.name.trim().length < 2) {
        throw new Error("Report name must be at least 2 characters");
      }
      await api.post("/reports", {
        name: newReport.name,
        template: newReport.template,
        format: newReport.format,
        prompt: newReport.prompt,
        workspaceId: newReport.workspaceId || undefined,
      });
      setNewReport({ name: "", template: "custom", format: "json", prompt: "", workspaceId: "" });
      toast.success("Report created and generation started");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to create report";
      setFieldError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleGenerateReport(reportId) {
    if (busyAction) return;
    setBusyAction(`generate-report-${reportId}`);
    setError("");
    try {
      await api.post(`/reports/${reportId}/generate`);
      toast.success("Report regenerated");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to generate report";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
    }
  }

  async function handleDownloadReport(reportId, reportName) {
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_URL}/reports/${reportId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportName}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      const message = err.message || "Failed to download report";
      setError(message);
      toast.error(message);
    }
  }

  async function handleDeleteReport(reportId) {
    if (busyAction) return;
    setBusyAction(`delete-report-${reportId}`);
    setError("");
    try {
      await api.del(`/reports/${reportId}`);
      toast.success("Report deleted");
      await loadData(true);
    } catch (err) {
      const message = err.message || "Failed to delete report";
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction("");
      setConfirmState(null);
    }
  }

  async function handleLogout() {
    await logout();
    toast.info("Logged out successfully");
  }

  async function handleDeleteProfile() {
    try {
      await api.del("/auth/profile");
      toast.info("Account deleted");
      await logout();
      navigate("/");
    } catch (err) {
      const message = err.message || "Failed to delete account";
      setError(message);
      toast.error(message);
    }
  }

  if (loading) {
    return <p className="text-center py-5">Loading dashboard...</p>;
  }

  const allowedSections = [
    "overview",
    "workspaces",
    "team",
    "api-keys",
    "reports",
    "analytics",
    "subscription",
    "settings",
    "docs",
  ];
  const activeSection = allowedSections.includes(section) ? section : "overview";
  const sectionTitleMap = {
    overview: "Dashboard Overview",
    workspaces: "Workspaces",
    team: "Team",
    "api-keys": "API Keys",
    reports: "Reports",
    analytics: "Analytics",
    subscription: "Subscription",
    settings: "Organization Settings",
    docs: "API Docs",
  };

  return (
    <section className="container-fluid py-4">
      <div className="row g-3">
        <aside className="col-12 col-xl-3 col-xxl-2">
          <div className="card custom-card p-3 sticky-top" style={{ top: "5.5rem" }}>
            <p className="text-uppercase fs-12 mb-1 text-primary">Workspace Console</p>
            <h3>{org?.name || "Organization"}</h3>
            <p className="text-muted mb-3">Plan: {org?.plan || "starter"}</p>
            <nav className="nav flex-column gap-2" aria-label="Dashboard sections">
              {[
                { to: "/app/overview", icon: "ri-dashboard-line", label: "Overview" },
                { to: "/app/workspaces", icon: "ri-database-2-line", label: "Workspaces" },
                { to: "/app/team", icon: "ri-team-line", label: "Team" },
                { to: "/app/api-keys", icon: "ri-key-2-line", label: "API Keys" },
                { to: "/app/reports", icon: "ri-file-chart-line", label: "Reports" },
                { to: "/app/analytics", icon: "ri-bar-chart-box-line", label: "Analytics" },
                { to: "/app/subscription", icon: "ri-copper-diamond-line", label: "Subscription" },
                { to: "/app/settings", icon: "ri-settings-3-line", label: "Settings" },
                { to: "/app/docs", icon: "ri-article-line", label: "Docs" },
              ].map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `btn btn-wave text-start d-flex align-items-center gap-2 ${isActive ? "btn-primary" : "btn-light"}`
                  }
                >
                  <i className={icon}></i> {label}
                </NavLink>
              ))}
            </nav>
            <button type="button" className="btn btn-light btn-wave mt-3 w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
              <i className="ri-logout-box-line"></i> Logout
            </button>
          </div>
        </aside>

        <div className="col-12 col-xl-9 col-xxl-10">
          <div className="card custom-card p-3 p-lg-4">
            <div className="d-flex align-items-center justify-content-between page-header-breadcrumb flex-wrap gap-2">
              <div>
                <h2 className="mb-1">{sectionTitleMap[activeSection]}</h2>
                <p className="text-muted mb-0">Welcome back, {user?.name || "user"}. Manage resources with confidence.</p>
              </div>
              <button
                type="button"
                className="btn btn-light btn-wave"
                onClick={() => loadData(true)}
                disabled={isRefreshing || Boolean(busyAction)}
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {error && <p className="alert alert-danger mt-3">{error}</p>}
            {fieldError && <p className="alert alert-warning mt-3">{fieldError}</p>}

            <div className="row g-3 mt-1">
              <div className="col-12 col-xxl-8">
                <div className="d-grid gap-3">
                  {(activeSection === "overview" || activeSection === "settings") && <section className="card custom-card" id="organization">
                    <div className="card-body">
                      <h3 className="h5">Organization</h3>
                      {org ? (
                        <div className="card mt-3">
                          <div className="card-body">
                            <p><strong>{org.name}</strong></p>
                            <p>Plan: {org.plan}</p>
                            <p className="mb-0">Slug: {org.slug}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="mb-0">No organization found.</p>
                      )}
                    </div>
                  </section>}

                  {(activeSection === "overview" || activeSection === "team") && <section className="card custom-card" id="team-invites">
                    <div className="card-body">
                      <h3 className="h5">Pending Invitations</h3>
                      {isRefreshing ? (
                        <SectionSkeleton rows={2} />
                      ) : invitations.length === 0 ? (
                        <p className="mb-0">No invitations yet.</p>
                      ) : (
                        <ul className="list-group mt-3">
                          {invitations.map((invite) => (
                            <li key={invite._id} className="list-group-item bg-transparent text-reset border-secondary-subtle">
                              <strong>{invite.email}</strong> — {invite.role}
                              <p className="text-muted mb-2">Status: {invite.status}</p>
                              {invite.status === "pending" && (
                                <button
                                  type="button"
                                  className="btn btn-light btn-wave btn-sm"
                                  onClick={() => handleRevokeInvite(invite._id)}
                                  disabled={Boolean(busyAction)}
                                >
                                  {busyAction === `revoke-invite-${invite._id}` ? "Revoking..." : "Revoke"}
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>}

                  {(activeSection === "overview" || activeSection === "workspaces") && <section className="card custom-card" id="workspaces">
                    <div className="card-body">
                      <h3 className="h5">Workspaces</h3>
                      {isRefreshing ? (
                        <SectionSkeleton rows={3} />
                      ) : workspaces.length === 0 ? (
                        <p className="mb-0">No workspaces yet.</p>
                      ) : (
                        <ul className="list-group mt-3">
                          {workspaces.map((ws) => (
                            <li key={ws._id} className="list-group-item bg-transparent text-reset border-secondary-subtle">
                              <strong>{ws.name}</strong> — {ws.databaseType}
                              <p className="text-muted mb-2">{ws.databaseConfig.database || "no database"}</p>
                              <button
                                type="button"
                                className="btn btn-light btn-wave btn-sm"
                                onClick={() =>
                                  setConfirmState({
                                    title: "Delete workspace",
                                    message: "This action cannot be undone. Continue?",
                                    confirmLabel: "Delete",
                                    action: () => handleDeleteWorkspace(ws._id),
                                  })
                                }
                              >
                                {busyAction === `delete-workspace-${ws._id}` ? "Deleting..." : "Delete"}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>}

                  {(activeSection === "overview" || activeSection === "team") && <section className="card custom-card" id="team">
                    <div className="card-body">
                      <h3 className="h5">Team</h3>
                      {isRefreshing ? (
                        <SectionSkeleton rows={3} />
                      ) : members.length === 0 ? (
                        <p className="mb-0">No team members found.</p>
                      ) : (
                        <ul className="list-group mt-3">
                          {members.map((member) => (
                            <li key={member._id} className="list-group-item bg-transparent text-reset border-secondary-subtle">
                              <strong>{member.name}</strong> — {member.email}
                              <p className="text-muted mb-2">Role: {member.role}</p>
                              {member.role !== "owner" && member._id !== user?.id && (
                                <div className="d-flex gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    className="btn btn-light btn-wave btn-sm"
                                    onClick={() =>
                                      handleUpdateMemberRole(member._id, member.role === "admin" ? "member" : "admin")
                                    }
                                    disabled={Boolean(busyAction)}
                                  >
                                    {busyAction === `update-role-${member._id}`
                                      ? "Updating..."
                                      : `Make ${member.role === "admin" ? "Member" : "Admin"}`}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-light btn-wave btn-sm"
                                    onClick={() =>
                                      setConfirmState({
                                        title: "Remove team member",
                                        message: "This user will lose access to this organization. Continue?",
                                        confirmLabel: "Remove",
                                        action: () => handleRemoveMember(member._id),
                                      })
                                    }
                                  >
                                    {busyAction === `remove-member-${member._id}` ? "Removing..." : "Remove"}
                                  </button>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>}

                  {(activeSection === "overview" || activeSection === "api-keys") && <section className="card custom-card" id="api-keys">
                    <div className="card-body">
                      <h3 className="h5">API Keys</h3>
                      {isRefreshing ? (
                        <SectionSkeleton rows={3} />
                      ) : apiKeys.length === 0 ? (
                        <p className="mb-0">No API keys yet.</p>
                      ) : (
                        <ul className="list-group mt-3">
                          {apiKeys.map((key) => (
                            <li key={key._id} className="list-group-item bg-transparent text-reset border-secondary-subtle">
                              <strong>{key.name}</strong> — {key.isActive ? "Active" : "Inactive"}
                              <p className="text-muted mb-2">
                                Prefix: {key.keyPrefix} | Permissions: {key.permissions.join(", ")}
                              </p>
                              <div className="d-flex gap-2 flex-wrap">
                                <button type="button" className="btn btn-light btn-wave btn-sm" onClick={() => handleToggleApiKey(key)}>
                                  {busyAction === `toggle-key-${key._id}` ? "Updating..." : key.isActive ? "Disable" : "Enable"}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-light btn-wave btn-sm"
                                  onClick={() =>
                                    setConfirmState({
                                      title: "Regenerate API key",
                                      message: "Existing clients using old key will fail. Continue?",
                                      confirmLabel: "Regenerate",
                                      action: () => handleRegenerateApiKey(key._id),
                                    })
                                  }
                                  disabled={Boolean(busyAction)}
                                >
                                  {busyAction === `regenerate-key-${key._id}` ? "Regenerating..." : "Regenerate"}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-light btn-wave btn-sm"
                                  onClick={() =>
                                    setConfirmState({
                                      title: "Delete API key",
                                      message: "This action cannot be undone. Continue?",
                                      confirmLabel: "Delete",
                                      action: () => handleDeleteApiKey(key._id),
                                    })
                                  }
                                >
                                  {busyAction === `delete-key-${key._id}` ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>}

                  {activeSection === "reports" && <section className="card custom-card" id="reports">
                    <div className="card-body">
                      <h3 className="h5">Reports</h3>
                      <form onSubmit={handleCreateReport} className="row g-3 mt-1 mb-4">
                        <div className="col-12 col-md-4">
                          <label className="form-label text-default">Name
                            <input className="form-control" type="text" value={newReport.name} onChange={(e) => setNewReport({ ...newReport, name: e.target.value })} required />
                          </label>
                        </div>
                        <div className="col-12 col-md-3">
                          <label className="form-label text-default">Template
                            <select className="form-control" value={newReport.template} onChange={(e) => setNewReport({ ...newReport, template: e.target.value })}>
                              <option value="custom">Custom</option>
                              <option value="executive">Executive</option>
                              <option value="sales">Sales</option>
                              <option value="analytics">Analytics</option>
                              <option value="financial">Financial</option>
                            </select>
                          </label>
                        </div>
                        <div className="col-12 col-md-2">
                          <label className="form-label text-default">Format
                            <select className="form-control" value={newReport.format} onChange={(e) => setNewReport({ ...newReport, format: e.target.value })}>
                              <option value="json">JSON</option>
                              <option value="csv">CSV</option>
                              <option value="pdf">PDF</option>
                              <option value="xlsx">XLSX</option>
                            </select>
                          </label>
                        </div>
                        <div className="col-12 col-md-3">
                          <label className="form-label text-default">Workspace
                            <select className="form-control" value={newReport.workspaceId} onChange={(e) => setNewReport({ ...newReport, workspaceId: e.target.value })}>
                              <option value="">Organization-wide</option>
                              {workspaces.map((ws) => (
                                <option key={ws._id} value={ws._id}>{ws.name}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="col-12">
                          <label className="form-label text-default">Prompt / Question
                            <textarea className="form-control" rows={2} value={newReport.prompt} onChange={(e) => setNewReport({ ...newReport, prompt: e.target.value })} placeholder="What should the report cover?" />
                          </label>
                        </div>
                        <div className="col-12 d-grid">
                          <button type="submit" className="btn btn-primary btn-wave" disabled={Boolean(busyAction)}>
                            {busyAction === "create-report" ? "Creating..." : "Create Report"}
                          </button>
                        </div>
                      </form>

                      {isRefreshing ? (
                        <SectionSkeleton rows={3} />
                      ) : reports.length === 0 ? (
                        <p className="mb-0">No reports yet.</p>
                      ) : (
                        <ul className="list-group">
                          {reports.map((report) => (
                            <li key={report._id} className="list-group-item bg-transparent text-reset border-secondary-subtle">
                              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                <div>
                                  <strong>{report.name}</strong>
                                  <p className="text-muted mb-0 fs-12">Template: {report.template} | Format: {report.format} | Status: <span className={`badge ${report.status === "completed" ? "bg-success" : report.status === "failed" ? "bg-danger" : "bg-secondary"}`}>{report.status}</span></p>
                                </div>
                                <div className="btn-list">
                                  {report.status === "completed" && (
                                    <>
                                      <button type="button" className="btn btn-light btn-wave btn-sm" onClick={() => setViewingReport(report)}><i className="ri-eye-line"></i> View</button>
                                      <button type="button" className="btn btn-light btn-wave btn-sm" onClick={() => handleDownloadReport(report._id, `${report.name}.${report.format === "xlsx" ? "csv" : report.format}`)}><i className="ri-download-line"></i> Download</button>
                                    </>
                                  )}
                                  <button type="button" className="btn btn-light btn-wave btn-sm" onClick={() => handleGenerateReport(report._id)} disabled={Boolean(busyAction)}>
                                    <i className="ri-refresh-line"></i> {busyAction === `generate-report-${report._id}` ? "Generating..." : "Regenerate"}
                                  </button>
                                  <button type="button" className="btn btn-light btn-wave btn-sm" onClick={() =>
                                    setConfirmState({
                                      title: "Delete report",
                                      message: "This action cannot be undone. Continue?",
                                      confirmLabel: "Delete",
                                      action: () => handleDeleteReport(report._id),
                                    })
                                  } disabled={Boolean(busyAction)}>
                                    <i className="ri-delete-bin-line"></i> Delete
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {viewingReport && (
                        <div className="card custom-card mt-3">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fs-14">{viewingReport.name}</h5>
                            <button type="button" className="btn btn-sm btn-light" onClick={() => setViewingReport(null)}>Close</button>
                          </div>
                          <div className="card-body">
                            <pre className="mb-0" style={{ whiteSpace: "pre-wrap", maxHeight: "24rem", overflow: "auto" }}>{viewingReport.content || "No content"}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>}

                  {activeSection === "analytics" && <section className="card custom-card" id="analytics">
                    <div className="card-body">
                      <h3 className="h5">Usage Overview</h3>
                      {isRefreshing || !analytics ? (
                        <SectionSkeleton rows={4} />
                      ) : (
                        <div className="row g-3 mt-1">
                          <div className="col-6 col-md-4 col-xl-3">
                            <div className="card custom-card bg-primary-transparent border-primary">
                              <div className="card-body">
                                <p className="text-muted mb-1 fs-12">Total Requests</p>
                                <h4 className="mb-0">{analytics.stats.totalRequests}</h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-6 col-md-4 col-xl-3">
                            <div className="card custom-card bg-success-transparent border-success">
                              <div className="card-body">
                                <p className="text-muted mb-1 fs-12">Today</p>
                                <h4 className="mb-0">{analytics.stats.todayRequests}</h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-6 col-md-4 col-xl-3">
                            <div className="card custom-card bg-info-transparent border-info">
                              <div className="card-body">
                                <p className="text-muted mb-1 fs-12">This Week</p>
                                <h4 className="mb-0">{analytics.stats.weekRequests}</h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-6 col-md-4 col-xl-3">
                            <div className="card custom-card bg-warning-transparent border-warning">
                              <div className="card-body">
                                <p className="text-muted mb-1 fs-12">Active Users</p>
                                <h4 className="mb-0">{analytics.stats.activeUsers}</h4>
                              </div>
                            </div>
                          </div>

                          <div className="col-12 col-lg-8">
                            <div className="card custom-card">
                              <div className="card-body">
                                <h4 className="h6">Daily Requests (Last 7 Days)</h4>
                                <div className="d-flex align-items-end gap-3" style={{ minHeight: "8rem" }}>
                                  {analytics.dailyRequests.map((day) => {
                                    const max = Math.max(...analytics.dailyRequests.map((d) => d.count), 1);
                                    const height = `${(day.count / max) * 100}%`;
                                    return (
                                      <div key={day.date} className="d-flex flex-column align-items-center flex-fill">
                                        <div
                                          className="bg-primary rounded-top w-100"
                                          style={{ height, minHeight: "0.25rem" }}
                                        />
                                        <span className="fs-11 text-muted mt-1">{day.date.slice(5)}</span>
                                        <span className="fw-semibold fs-12">{day.count}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-12 col-lg-4">
                            <div className="card custom-card">
                              <div className="card-body">
                                <h4 className="h6">Quota</h4>
                                <ul className="list-group list-group-flush mt-2">
                                  <li className="list-group-item bg-transparent border-0 px-0 d-flex justify-content-between">
                                    <span>API Requests</span>
                                    <span className="fw-semibold">{analytics.quota.apiRequests} / {analytics.quota.apiRequestsLimit}</span>
                                  </li>
                                  <li className="list-group-item bg-transparent border-0 px-0 d-flex justify-content-between">
                                    <span>Queries</span>
                                    <span className="fw-semibold">{analytics.quota.queryCount} / {analytics.quota.queryLimit}</span>
                                  </li>
                                  <li className="list-group-item bg-transparent border-0 px-0 d-flex justify-content-between">
                                    <span>Reports</span>
                                    <span className="fw-semibold">{analytics.quota.reportCount} / {analytics.quota.reportLimit}</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="card custom-card">
                              <div className="card-body">
                                <h4 className="h6">Recent Activity</h4>
                                {analytics.recentActivity.length === 0 ? (
                                  <p className="text-muted mb-0">No activity yet.</p>
                                ) : (
                                  <ul className="list-group list-group-flush mt-2">
                                    {analytics.recentActivity.map((log) => (
                                      <li key={log._id} className="list-group-item bg-transparent border-secondary-subtle px-0">
                                        <div className="d-flex justify-content-between align-items-start">
                                          <div>
                                            <p className="mb-0 fw-semibold">{log.endpoint}</p>
                                            <p className="mb-0 text-muted fs-12">
                                              {log.queryText ? `${log.queryText.slice(0, 60)}...` : "No query text"}
                                            </p>
                                          </div>
                                          <span className={`badge ${log.success ? "bg-success" : "bg-danger"}`}>
                                            {log.success ? "Success" : "Failed"}
                                          </span>
                                        </div>
                                        <p className="mb-0 fs-11 text-muted">
                                          {log.workspaceName ? `${log.workspaceName} · ` : ""}
                                          {new Date(log.createdAt).toLocaleString()}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <div className="card custom-card">
                              <div className="card-body">
                                <h4 className="h6">Top Workspaces</h4>
                                {analytics.topWorkspaces.length === 0 ? (
                                  <p className="text-muted mb-0">No workspace usage yet.</p>
                                ) : (
                                  <ul className="list-group list-group-flush mt-2">
                                    {analytics.topWorkspaces.map((item) => (
                                      <li key={item.workspaceId || "org-wide"} className="list-group-item bg-transparent border-0 px-0 d-flex justify-content-between">
                                        <span>{item.workspaceName}</span>
                                        <span className="fw-semibold">{item.count}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <div className="card custom-card">
                              <div className="card-body">
                                <h4 className="h6">Top Endpoints</h4>
                                {analytics.topEndpoints.length === 0 ? (
                                  <p className="text-muted mb-0">No endpoint usage yet.</p>
                                ) : (
                                  <ul className="list-group list-group-flush mt-2">
                                    {analytics.topEndpoints.map((item) => (
                                      <li key={item._id} className="list-group-item bg-transparent border-0 px-0 d-flex justify-content-between">
                                        <span>{item._id}</span>
                                        <span className="fw-semibold">{item.count}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>}

                  {activeSection === "subscription" && <section className="card custom-card" id="subscription">
                    <div className="card-body">
                      <h3 className="h5">Subscription Plan</h3>
                      {isRefreshing || !subscription ? (
                        <SectionSkeleton rows={3} />
                      ) : (
                        <div className="row g-3 mt-1">
                          <div className="col-12">
                            <div className="card custom-card border-primary">
                              <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-2">
                                <div>
                                  <p className="text-muted mb-1 fs-12">Current Plan</p>
                                  <h4 className="mb-0">{subscription.currentPlan.name}</h4>
                                </div>
                                <div>
                                  <p className="text-muted mb-1 fs-12">Monthly Price</p>
                                  <h4 className="mb-0">{subscription.currentPlan.price === null ? "Custom" : `$${subscription.currentPlan.price}`}</h4>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="card custom-card">
                              <div className="card-body">
                                <h4 className="h6">Usage This Cycle</h4>
                                <div className="row g-3 mt-1">
                                  <div className="col-12 col-md-4">
                                    <p className="text-muted mb-1 fs-12">API Requests</p>
                                    <p className="mb-0 fw-semibold">{subscription.usage.apiRequests} / {subscription.usage.apiRequestsLimit}</p>
                                  </div>
                                  <div className="col-12 col-md-4">
                                    <p className="text-muted mb-1 fs-12">Queries</p>
                                    <p className="mb-0 fw-semibold">{subscription.usage.queryCount} / {subscription.usage.queryLimit}</p>
                                  </div>
                                  <div className="col-12 col-md-4">
                                    <p className="text-muted mb-1 fs-12">Reports</p>
                                    <p className="mb-0 fw-semibold">{subscription.usage.reportCount} / {subscription.usage.reportLimit}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <h4 className="h6">Available Plans</h4>
                            <div className="row g-3">
                              {subscription.plans.map((plan) => (
                                <div key={plan.id} className="col-12 col-md-6 col-lg-3">
                                  <div className={`card custom-card ${subscription.currentPlan.id === plan.id ? "border-primary" : ""}`}>
                                    <div className="card-body">
                                      <h5 className="mb-1">{plan.name}</h5>
                                      <p className="text-muted fs-12 mb-2">
                                        {plan.price === null ? "Custom pricing" : `$${plan.price}/mo`}
                                      </p>
                                      <ul className="list-unstyled fs-12 mb-3">
                                        {plan.features.map((feature, idx) => (
                                          <li key={idx} className="d-flex align-items-start gap-2 mb-1">
                                            <span className="text-primary">✓</span>
                                            {feature}
                                          </li>
                                        ))}
                                      </ul>
                                      <button
                                        type="button"
                                        className="btn btn-primary btn-wave w-100"
                                        disabled={subscription.currentPlan.id === plan.id || Boolean(busyAction)}
                                        onClick={() => handleUpgradePlan(plan.id)}
                                      >
                                        {busyAction === `upgrade-plan-${plan.id}` ? "Upgrading..." : subscription.currentPlan.id === plan.id ? "Current" : "Upgrade"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>}

                  {activeSection === "settings" && <section className="card custom-card" id="settings">
                    <div className="card-body">
                      <h3 className="h5">Organization Settings</h3>
                      <div className="row g-3 mt-1">
                        <div className="col-12 col-lg-6">
                          <div className="card custom-card">
                            <div className="card-body">
                              <h4 className="h6">Organization Details</h4>
                              {org?.logo && (
                                <div className="mb-3 text-center">
                                  <img src={org.logo} alt="Organization logo" className="img-thumbnail" style={{ maxHeight: "8rem" }} />
                                </div>
                              )}
                              <form onSubmit={handleUpdateOrganization} className="row gy-3 mt-1">
                                <label className="col-12 form-label text-default">
                                  Name
                                  <input
                                    className="form-control"
                                    type="text"
                                    value={orgSettings.name}
                                    onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                                    required
                                    minLength={2}
                                  />
                                </label>
                                <div className="col-12">
                                  <label className="form-label text-default">
                                    Logo
                                    <input
                                      className="form-control"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleUpdateOrganizationLogo(e.target.files[0])}
                                      disabled={Boolean(busyAction)}
                                    />
                                  </label>
                                </div>
                                <div className="col-12 d-grid gap-2">
                                  <button
                                    type="submit"
                                    className="btn btn-primary btn-wave"
                                    disabled={busyAction === "update-organization" || Boolean(busyAction)}
                                  >
                                    {busyAction === "update-organization" ? "Saving..." : "Save Organization"}
                                  </button>
                                  {org?.logo && (
                                    <button
                                      type="button"
                                      className="btn btn-light btn-wave"
                                      onClick={() =>
                                        setConfirmState({
                                          title: "Remove logo",
                                          message: "Remove the organization logo?",
                                          confirmLabel: "Remove",
                                          action: handleDeleteOrganizationLogo,
                                        })
                                      }
                                      disabled={Boolean(busyAction)}
                                    >
                                      Remove Logo
                                    </button>
                                  )}
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>

                        <div className="col-12 col-lg-6">
                          <div className="card custom-card">
                            <div className="card-body">
                              <h4 className="h6">Profile</h4>
                              <form onSubmit={handleUpdateProfile} className="row gy-3 mt-1">
                                <label className="col-12 form-label text-default">
                                  Display Name
                                  <input
                                    className="form-control"
                                    type="text"
                                    value={profileSettings.name}
                                    onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                                    required
                                    minLength={2}
                                  />
                                </label>
                                <label className="col-12 form-label text-default">
                                  New Password
                                  <input
                                    className="form-control"
                                    type="password"
                                    value={profileSettings.password}
                                    onChange={(e) => setProfileSettings({ ...profileSettings, password: e.target.value })}
                                    placeholder="Leave blank to keep current password"
                                    minLength={8}
                                  />
                                </label>
                                <div className="col-12 d-grid">
                                  <button
                                    type="submit"
                                    className="btn btn-primary btn-wave"
                                    disabled={busyAction === "update-profile" || Boolean(busyAction)}
                                  >
                                    {busyAction === "update-profile" ? "Saving..." : "Update Profile"}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="card custom-card border-danger">
                            <div className="card-body">
                              <h4 className="h6 text-danger">Danger Zone</h4>
                              <p className="text-muted fs-14 mb-3">Deleting your account will permanently remove your user data and organization if you are the owner.</p>
                              <button
                                type="button"
                                className="btn btn-danger btn-wave"
                                onClick={() =>
                                  setConfirmState({
                                    title: "Delete account",
                                    message: "This action cannot be undone. Are you sure?",
                                    confirmLabel: "Delete",
                                    action: handleDeleteProfile,
                                  })
                                }
                                disabled={Boolean(busyAction)}
                              >
                                Delete Account
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>}

                  {activeSection === "docs" && <section className="card custom-card" id="docs">
                    <div className="card-body">
                      <h3 className="h5">API Reference</h3>
                      <p className="text-muted mb-3">Base URL: <code>{import.meta.env.VITE_API_URL || "/api/v1"}</code></p>
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Method</th>
                              <th>Endpoint</th>
                              <th>Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td>POST</td><td>/api/v1/auth/register</td><td>Register a new user and organization</td></tr>
                            <tr><td>POST</td><td>/api/v1/auth/login</td><td>Authenticate and receive tokens</td></tr>
                            <tr><td>POST</td><td>/api/v1/auth/refresh</td><td>Refresh access token</td></tr>
                            <tr><td>GET</td><td>/api/v1/organizations</td><td>Get current organization</td></tr>
                            <tr><td>PUT</td><td>/api/v1/organizations</td><td>Update organization name</td></tr>
                            <tr><td>GET</td><td>/api/v1/workspaces</td><td>List workspaces</td></tr>
                            <tr><td>POST</td><td>/api/v1/workspaces</td><td>Create a workspace</td></tr>
                            <tr><td>GET</td><td>/api/v1/api-keys</td><td>List API keys</td></tr>
                            <tr><td>POST</td><td>/api/v1/api-keys</td><td>Create an API key</td></tr>
                            <tr><td>GET</td><td>/api/v1/teams</td><td>List team members</td></tr>
                            <tr><td>POST</td><td>/api/v1/teams/invites</td><td>Invite a team member</td></tr>
                            <tr><td>POST</td><td>/api/v1/teams/accept-invite</td><td>Accept an invitation token</td></tr>
                            <tr><td>GET</td><td>/api/v1/reports</td><td>List reports</td></tr>
                            <tr><td>POST</td><td>/api/v1/reports</td><td>Create a report</td></tr>
                            <tr><td>GET</td><td>/api/v1/analytics</td><td>Get usage analytics</td></tr>
                            <tr><td>GET</td><td>/api/v1/subscriptions</td><td>Get current subscription</td></tr>
                            <tr><td>POST</td><td>/api/v1/subscriptions/upgrade</td><td>Upgrade or change plan</td></tr>
                            <tr><td>POST</td><td>/api/v1/public/chat</td><td>Public chat endpoint for widget/API key access</td></tr>
                            <tr><td>GET</td><td>/api/v1/public/workspace</td><td>Fetch workspace info via API key</td></tr>
                            <tr><td>GET</td><td>/api/v1/public/usage</td><td>Fetch usage and quotas via API key</td></tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="row g-3 mt-2">
                        <div className="col-12 col-lg-6">
                          <div className="card custom-card">
                            <div className="card-body">
                              <h4 className="h6">Widget Testing</h4>
                              <p className="text-muted fs-12 mb-3">Use an API key from the API Keys section, ask a question, and test the same flow your website widget will use.</p>
                              <form onSubmit={handleTestWidgetChat} className="row gy-3">
                                <label className="col-12 form-label text-default">
                                  API Key
                                  <input
                                    className="form-control"
                                    type="text"
                                    value={widgetApiKey}
                                    onChange={(e) => setWidgetApiKey(e.target.value)}
                                    placeholder="Paste generated API key"
                                  />
                                </label>
                                <label className="col-12 form-label text-default">
                                  Test Question
                                  <textarea
                                    className="form-control"
                                    rows="3"
                                    value={widgetQuestion}
                                    onChange={(e) => setWidgetQuestion(e.target.value)}
                                    placeholder="e.g. Show me monthly sales trend for this workspace"
                                  />
                                </label>
                                <div className="col-12 d-grid">
                                  <button type="submit" className="btn btn-primary btn-wave" disabled={Boolean(busyAction)}>
                                    {busyAction === "test-widget" ? "Testing Widget..." : "Test Widget Chat"}
                                  </button>
                                </div>
                              </form>
                              {widgetAnswer && (
                                <div className="mt-3 p-3 border rounded border-secondary-subtle bg-transparent">
                                  <p className="mb-1 fs-12 text-muted">Widget Response</p>
                                  <p className="mb-0">{widgetAnswer}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-12 col-lg-6">
                          <div className="card custom-card">
                            <div className="card-body">
                              <div className="d-flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
                                <h4 className="h6 mb-0">Embed Code</h4>
                                <button type="button" className="btn btn-light btn-sm btn-wave" onClick={handleCopyWidgetCode}>
                                  Copy Snippet
                                </button>
                              </div>
                              <p className="text-muted fs-12 mb-2">Paste this before <code>{"</body>"}</code> on your website.</p>
                              <textarea className="form-control" rows="16" value={widgetEmbedCode} readOnly />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>}
                </div>
              </div>

              <aside className="col-12 col-xxl-4" id="actions">
                <div className="d-grid gap-3">
                  {(activeSection === "overview" || activeSection === "api-keys") && apiKeyToken && (
                    <div className="card custom-card">
                      <div className="card-body">
                        <p className="mb-2">New key generated. Copy it now — it won't be shown again.</p>
                        <code>{apiKeyToken}</code>
                      </div>
                    </div>
                  )}

                  {(activeSection === "overview" || activeSection === "api-keys") && <div className="card custom-card">
                    <div className="card-body">
                      <h4 className="h6">Create API Key</h4>
                      <form onSubmit={handleCreateApiKey} className="row gy-3">
                        <label className="col-12 form-label text-default">
                          Name
                          <input
                            className="form-control"
                            type="text"
                            value={newApiKey.name}
                            onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                            required
                          />
                        </label>
                        <label className="col-12 form-label text-default">
                          Workspace
                          <select
                            className="form-control"
                            value={newApiKey.workspaceId}
                            onChange={(e) => setNewApiKey({ ...newApiKey, workspaceId: e.target.value })}
                          >
                            <option value="">Organization-wide</option>
                            {workspaces.map((ws) => (
                              <option key={ws._id} value={ws._id}>
                                {ws.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="col-12 d-grid">
                          <button type="submit" className="btn btn-primary btn-wave">
                            {busyAction === "create-api-key" ? "Generating..." : "Generate Key"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>}

                  {(activeSection === "overview" || activeSection === "workspaces") && <div className="card custom-card">
                    <div className="card-body">
                      <h4 className="h6">Create Workspace</h4>
                      <form onSubmit={handleCreateWorkspace} className="row gy-3">
                        <label className="col-12 form-label text-default">
                          Name
                          <input
                            className="form-control"
                            type="text"
                            value={newWorkspace.name}
                            onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                            required
                          />
                        </label>
                        <label className="col-12 form-label text-default">
                          Database Type
                          <select
                            className="form-control"
                            value={newWorkspace.databaseType}
                            onChange={(e) => setNewWorkspace({ ...newWorkspace, databaseType: e.target.value })}
                          >
                            <option value="mysql">MySQL</option>
                            <option value="postgresql">PostgreSQL</option>
                            <option value="mongodb">MongoDB</option>
                            <option value="sqlite">SQLite</option>
                          </select>
                        </label>
                        <label className="col-12 form-label text-default">
                          Connection JSON
                          <textarea
                            className="form-control"
                            value={newWorkspace.databaseConfig}
                            onChange={(e) => setNewWorkspace({ ...newWorkspace, databaseConfig: e.target.value })}
                            rows="3"
                          />
                        </label>
                        <div className="col-12">
                          <div className="btn-list d-grid gap-2">
                            <button type="button" className="btn btn-outline-secondary btn-wave" onClick={handleTestConnection} disabled={Boolean(busyAction)}>
                              {busyAction === "test-connection" ? "Testing..." : "Test Connection"}
                            </button>
                            <button type="submit" className="btn btn-primary btn-wave" disabled={Boolean(busyAction)}>
                              {busyAction === "create-workspace" ? "Creating..." : "Create Workspace"}
                            </button>
                          </div>
                        </div>
                      </form>
                      {testConnectionCollections.length > 0 && (
                        <div className="mt-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <h5 className="h6 mb-0">Collections / Tables</h5>
                            <button
                              type="button"
                              className="btn btn-sm btn-link p-0"
                              onClick={handleTestConnection}
                              disabled={Boolean(busyAction)}
                            >
                              {busyAction === "test-connection" ? "Refreshing..." : "Refresh"}
                            </button>
                          </div>
                          <ul className="list-group">
                            {testConnectionCollections.map((name, idx) => (
                              <li key={idx} className="list-group-item bg-transparent text-reset border-secondary-subtle py-1">
                                {name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>}

                  {(activeSection === "overview" || activeSection === "team") && <div className="card custom-card">
                    <div className="card-body">
                      <h4 className="h6">Invite Team Member</h4>
                      <form onSubmit={handleInviteMember} className="row gy-3">
                        <label className="col-12 form-label text-default">
                          Member Email
                          <input
                            className="form-control"
                            type="email"
                            value={newInvite.email}
                            onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                            required
                          />
                        </label>
                        <label className="col-12 form-label text-default">
                          Role
                          <select
                            className="form-control"
                            value={newInvite.role}
                            onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </label>
                        <div className="col-12 d-grid">
                          <button type="submit" className="btn btn-primary btn-wave">
                            {busyAction === "invite-member" ? "Sending..." : "Send Invite"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>}

                  {(activeSection === "overview" || activeSection === "team") && <div className="card custom-card">
                    <div className="card-body">
                      <h4 className="h6">Accept Invitation Token</h4>
                      <form onSubmit={handleAcceptInviteToken} className="row gy-3">
                        <label className="col-12 form-label text-default">
                          Invite Token
                          <input
                            className="form-control"
                            type="text"
                            value={inviteToken}
                            onChange={(e) => setInviteToken(e.target.value)}
                            required
                          />
                        </label>
                        <div className="col-12 d-grid">
                          <button type="submit" className="btn btn-light btn-wave">
                            {busyAction === "accept-invite" ? "Accepting..." : "Accept Invite"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        busy={Boolean(busyAction)}
        onConfirm={() => confirmState?.action?.()}
        onCancel={() => setConfirmState(null)}
      />
    </section>
  );
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-center py-5">Loading session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function Footer() {
  return (
    <footer className="bg-primary-transparent py-4 mt-auto">
      <div className="container-fluid">
        <div className="row g-3 text-center text-md-start">
          <div className="col-12 col-md-6">
            <p className="mb-0 text-muted">Sukalp SaaS — AI-powered database chatbot for modern teams.</p>
          </div>
          <div className="col-12 col-md-6">
            <nav className="btn-list justify-content-center justify-content-md-end">
              <Link to="/about" className="btn btn-light btn-sm btn-wave">About</Link>
              <Link to="/contact" className="btn btn-light btn-sm btn-wave">Contact</Link>
              <Link to="/privacy" className="btn btn-light btn-sm btn-wave">Privacy</Link>
              <Link to="/terms" className="btn btn-light btn-sm btn-wave">Terms</Link>
            </nav>
          </div>
        </div>
        <p className="text-center text-muted fs-12 mt-3 mb-0">&copy; {new Date().getFullYear()} Sukalp AI. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function AboutPage() {
  return (
    <section className="container py-5">
      <div className="card custom-card p-4 p-lg-5 mb-4 text-center">
        <h1 className="mb-3">About Sukalp AI</h1>
        <p className="text-muted mb-0 max-w-3xl mx-auto">Empowering businesses with AI-powered database analytics. We make data accessible to everyone, regardless of technical background.</p>
      </div>
      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card custom-card p-4 text-center h-100">
            <h5 className="h6">Speed</h5>
            <p className="text-muted fs-12 mb-0">Get instant answers to data questions without waiting for dashboard refreshes.</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card custom-card p-4 text-center h-100">
            <h5 className="h6">Security</h5>
            <p className="text-muted fs-12 mb-0">Enterprise-grade security with scoped API keys and role-based access.</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card custom-card p-4 text-center h-100">
            <h5 className="h6">Simplicity</h5>
            <p className="text-muted fs-12 mb-0">Ask questions in plain language and get accurate, structured answers.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactPage() {
  return (
    <section className="container py-5">
      <div className="card custom-card p-4 p-lg-5">
        <h1 className="mb-3">Contact Us</h1>
        <p className="text-muted mb-4">Have questions? We&apos;d love to hear from you.</p>
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <form className="row g-3" onSubmit={(e) => e.preventDefault()}>
              <div className="col-12">
                <label className="form-label text-default">Full Name
                  <input className="form-control" type="text" placeholder="John Doe" />
                </label>
              </div>
              <div className="col-12">
                <label className="form-label text-default">Email
                  <input className="form-control" type="email" placeholder="john@example.com" />
                </label>
              </div>
              <div className="col-12">
                <label className="form-label text-default">Message
                  <textarea className="form-control" rows={4} placeholder="Your message..."></textarea>
                </label>
              </div>
              <div className="col-12 d-grid">
                <button type="submit" className="btn btn-primary btn-wave">Send Message</button>
              </div>
            </form>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card custom-card p-4 h-100">
              <h5 className="h6 mb-3">Get in touch</h5>
              <p className="text-muted fs-14 mb-2"><strong>Email:</strong> support@sukalp.ai</p>
              <p className="text-muted fs-14 mb-2"><strong>Phone:</strong> +91 98765 43210</p>
              <p className="text-muted fs-14 mb-0"><strong>Address:</strong> 123 Tech Park, Gurugram, Haryana 122001, India</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PrivacyPage() {
  return (
    <section className="container py-5">
      <div className="card custom-card p-4 p-lg-5">
        <h1 className="mb-3">Privacy Policy</h1>
        <p className="text-muted mb-4">Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
        <h5 className="h6">Information Collection</h5>
        <p className="text-muted fs-14">We collect account information, workspace configurations, and usage data to provide and improve our services.</p>
        <h5 className="h6 mt-3">Data Security</h5>
        <p className="text-muted fs-14">We use industry-standard security measures including encrypted connections, hashed passwords, and scoped API access.</p>
        <h5 className="h6 mt-3">Third Parties</h5>
        <p className="text-muted fs-14 mb-0">We do not sell your data. Third-party integrations are only used with your explicit configuration.</p>
      </div>
    </section>
  );
}

export function TermsPage() {
  return (
    <section className="container py-5">
      <div className="card custom-card p-4 p-lg-5">
        <h1 className="mb-3">Terms of Service</h1>
        <p className="text-muted mb-4">By using Sukalp SaaS, you agree to these terms.</p>
        <h5 className="h6">Use of Service</h5>
        <p className="text-muted fs-14">You may use Sukalp SaaS for lawful purposes only. You are responsible for all activity under your account.</p>
        <h5 className="h6 mt-3">Subscriptions</h5>
        <p className="text-muted fs-14">Plans and limits are defined per organization. Usage beyond your plan limits may be restricted.</p>
        <h5 className="h6 mt-3">Termination</h5>
        <p className="text-muted fs-14 mb-0">Either party may terminate the service relationship at any time. Data may be removed in accordance with our retention policy.</p>
      </div>
    </section>
  );
}
