'use client';

import { FormEvent, Suspense, useState } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mockUsers = [
    { email: "employee@hrms.com", password: "password", role: "Employee", name: "Sarah Johnson", designation: "Software Engineer", department: "Engineering", employeeId: "EMP001", joinDate: "2023-01-15" },
    { email: "manager@hrms.com", password: "password", role: "Manager", name: "Michael Scott", designation: "Engineering Manager", department: "Engineering", employeeId: "EMP002", joinDate: "2021-06-01" },
    { email: "hr@hrms.com", password: "password", role: "HR", name: "Priya Sharma", designation: "HR Specialist", department: "Human Resources", employeeId: "EMP003", joinDate: "2020-03-10" },
    { email: "admin@hrms.com", password: "password", role: "Admin", name: "Admin User", designation: "System Administrator", department: "IT", employeeId: "EMP004", joinDate: "2019-08-20" },
  ];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem("hrms_user", JSON.stringify(user));
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

          {/* Quick Login */}
          <div className="mt-6">
            <p className="text-xs text-gray-400 text-center mb-3">— Quick login for demo —</p>
            <div className="grid grid-cols-2 gap-2">
              {mockUsers.map((u) => (
                <button
                  key={u.role}
                  onClick={() => quickLogin(u)}
                  className="text-xs rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors text-left"
                >
                  <span className="font-medium text-teal-600">{u.role}</span>
                  <br />
                  <span className="text-gray-400">{u.email}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Password: <span className="font-mono">password</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}


// 'use client';

// import { FormEvent, Suspense, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useSession } from "../../../context/SessionContext";

// export default function LoginPage() {
// 	return (
// 		<Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
// 			<LoginForm />
// 		</Suspense>
// 	);
// }

// function LoginForm() {
// 	const router = useRouter();
// 	const searchParams = useSearchParams();
// 	const { login } = useSession();
// 	const [email, setEmail] = useState("");
// 	const [password, setPassword] = useState("");
// 	const [error, setError] = useState<string | null>(null);
// 	const [loading, setLoading] = useState(false);

// 	async function onSubmit(e: FormEvent) {
// 		e.preventDefault();
// 		setError(null);
// 		setLoading(true);
// 		try {
// 			await login({ email, password });
// 			const next = searchParams.get("next") || "/";
// 			router.replace(next);
// 		} catch (err: any) {
// 			setError(err?.message || "Login failed");
// 		} finally {
// 			setLoading(false);
// 		}
// 	}

// 	return (
// 		<div className="flex min-h-screen items-center justify-center p-4">
// 			<form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border p-6 space-y-4">
// 				<h1 className="text-xl font-semibold">Sign in</h1>
// 				<div className="space-y-2">
// 					<label className="block text-sm">Email</label>
// 					<input
// 						type="email"
// 						value={email}
// 						onChange={(e) => setEmail(e.target.value)}
// 						required
// 						className="w-full rounded border px-3 py-2"
// 						placeholder="you@example.com"
// 					/>
// 				</div>
// 				<div className="space-y-2">
// 					<label className="block text-sm">Password</label>
// 					<input
// 						type="password"
// 						value={password}
// 						onChange={(e) => setPassword(e.target.value)}
// 						required
// 						className="w-full rounded border px-3 py-2"
// 						placeholder="••••••••"
// 					/>
// 				</div>
// 				{error ? <p className="text-sm text-red-600">{error}</p> : null}
// 				<button
// 					type="submit"
// 					disabled={loading}
// 					className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-60"
// 				>
// 					{loading ? "Signing in..." : "Sign in"}
// 				</button>
// 			</form>
// 		</div>
// 	);
// }


