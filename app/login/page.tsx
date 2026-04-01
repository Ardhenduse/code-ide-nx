"use client";

import { useActionState } from "react";
import { login } from "../actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null as any);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">Login to CodeStudio</h1>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-300">Username</label>
            <input
              name="username"
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
          {state?.error && (
            <p className="text-red-400 text-sm bg-red-900/30 p-2 rounded">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors disabled:opacity-50"
          >
            {pending ? "Logging in..." : "Login (or Auto-Register)"}
          </button>
        </form>
      </div>
    </div>
  );
}
