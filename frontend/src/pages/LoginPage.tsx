import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Key, ChevronDown } from "lucide-react";
import { MOCK_USERS } from "../lib/mockData";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);

  const mockUsers = MOCK_USERS.map(u => ({ ...u, password: 'password' }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        const { password: _, ...userData } = user;
        localStorage.setItem("hrms_user", JSON.stringify(userData));
        Cookies.set("auth_token", "mock_token_" + userData.employeeId, { expires: 7, sameSite: "lax" });
        window.location.href = "/dashboard";
        return;
      }
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(u: typeof mockUsers[0]) {
    setEmail(u.email);
    setPassword(u.password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">W</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">WorkFlow</h1>
          <p className="text-gray-500 mt-1">Human Resource Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to your account</h2>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-2.5 text-white font-medium text-sm transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Collapsible Demo Profiles */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowDemoProfiles(!showDemoProfiles)}
              className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-teal-600 font-semibold py-1 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <Key size={14} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
                <span>DEMO PROFILES</span>
              </div>
              <ChevronDown 
                size={14}
                className={`transition-transform duration-300 ${showDemoProfiles ? 'rotate-180 text-teal-600' : 'text-gray-400'}`} 
              />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${showDemoProfiles ? 'max-h-[220px] mt-3 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <div className="grid grid-cols-2 gap-2">
                {mockUsers.map((u) => (
                  <button
                    key={u.role}
                    type="button"
                    onClick={() => quickLogin(u)}
                    className="text-[11px] rounded-lg border border-gray-150 p-2 hover:bg-teal-50/30 hover:border-teal-200 hover:text-teal-950 transition-all text-left text-gray-600 focus:outline-none"
                  >
                    <span className="font-bold text-teal-600">{u.role}</span>
                    <br />
                    <span className="text-[10px] text-gray-400 font-mono truncate block mt-0.5">{u.email}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">Password: <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">password</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
