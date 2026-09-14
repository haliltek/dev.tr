"use client";

import React, { useState, useEffect } from "react";

interface UserItem {
  id: string;
  name: string;
  username: string;
  image: string;
  reputation: number;
  role: string;
  createdAt: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Kayıtlı Geliştiriciler & Kullanıcılar
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          devcore.tr geliştirici topluluğundaki aktif üyeler ve itibar (reputation) puanları.
        </p>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50 uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Geliştirici</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">İtibar Puanı</th>
                <th className="px-6 py-4 font-semibold">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Kullanıcılar yükleniyor...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition dark:hover:bg-gray-800/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                          alt={u.name}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white block">
                            {u.name}
                          </span>
                          <span className="text-gray-400 font-mono text-[11px]">
                            @{u.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                        ⭐ {u.reputation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
