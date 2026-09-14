"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeCloseIcon, EyeIcon } from "@/icons";

export default function SignInForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
        setLoading(false);
        return;
      }

      // Success
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sunucuya bağlanılamadı.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/30">
              D
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              devcore<span className="text-blue-500">.tr</span>
            </span>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Admin
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Yönetim Merkezine Giriş
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            İçerik, kaynak, reklam ve tarayıcı ayarlarını yönetmek için oturum açın.
          </p>
        </div>

        {/* Credentials Info Badge */}
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-blue-600 dark:text-blue-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-300">
              <span className="font-semibold block mb-1">Varsayılan Giriş Bilgileri:</span>
              <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                <span>Kullanıcı: <strong>admin</strong></span>
                <span>Şifre: <strong>DevcoreAdmin2026!</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Yönetici Kullanıcı Adı
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeIcon className="h-5 w-5 fill-current" />
                ) : (
                  <EyeCloseIcon className="h-5 w-5 fill-current" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Doğrulanıyor...
              </span>
            ) : (
              "Yönetim Paneline Giriş Yap"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
          devcore.tr &copy; {new Date().getFullYear()} — Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}
