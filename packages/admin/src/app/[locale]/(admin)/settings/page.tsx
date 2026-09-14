"use client";

import React, { useState } from "react";

export default function SettingsManagementPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Yeni şifre ile onay şifresi birbiriyle eşleşmiyor." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Yeni şifreniz en az 6 karakter olmalıdır." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Yönetici şifreniz başarıyla güncellendi!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "Şifre değiştirme başarısız." });
      }
    } catch {
      setMessage({ type: "error", text: "Sunucu hatası oluştu." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sistem & Yönetici Güvenlik Ayarları
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Admin şifrenizi güncelleyin ve sistem durumunu denetleyin.
        </p>
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          Yönetici Şifresini Değiştir
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Admin paneli erişim şifrenizi buradan güvenle yenileyebilirsiniz.
        </p>

        {message && (
          <div
            className={`mb-5 rounded-xl p-4 text-xs font-medium ${
              message.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mevcut Yönetici Şifresi *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Yeni Şifre *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="En az 6 karakter"
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Yeni Şifre Tekrar *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yeni şifreyi tekrar yazın"
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>

      {/* System Info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          Sistem & Dağıtım Bilgileri
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Yönetim Paketi</span>
            <span className="font-mono font-semibold text-gray-900 dark:text-white">packages/admin (devcore-admin)</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Çalışma Portu</span>
            <span className="font-mono font-semibold text-gray-900 dark:text-white">5003</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Arayüz Altyapısı</span>
            <span className="font-mono font-semibold text-gray-900 dark:text-white">TailAdmin Next.js + Tailwind CSS v4</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Kimlik Doğrulama</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">Aktif (Edge JWT Middleware)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
