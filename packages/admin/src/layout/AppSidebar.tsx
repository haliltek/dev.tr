"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  GridIcon,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  UserCircleIcon,
} from "../icons/index";

type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  isLogout?: boolean;
  new?: boolean;
  target?: string;
  subItems?: {
    key: string;
    label: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    target?: string;
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    key: "dashboard",
    label: "Gösterge Paneli",
    path: "/",
  },
  {
    icon: <PageIcon />,
    key: "posts",
    label: "İçerikler (Yazılar)",
    path: "/posts",
  },
  {
    icon: <PlugInIcon />,
    key: "sources",
    label: "Kaynaklar & RSS",
    path: "/sources",
  },
  {
    icon: <BoxCubeIcon />,
    key: "ads",
    label: "Reklam & Sponsor",
    path: "/ads",
  },
  {
    icon: <PieChartIcon />,
    key: "crawler",
    label: "Tarayıcı (Crawler)",
    path: "/crawler",
  },
  {
    icon: <UserCircleIcon />,
    key: "users",
    label: "Kullanıcılar",
    path: "/users",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <ListIcon />,
    key: "settings",
    label: "Yönetici Ayarları",
    path: "/settings",
  },
  {
    icon: (
      <svg className="h-5 w-5 stroke-current fill-none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
    key: "logout",
    label: "Güvenli Çıkış",
    isLogout: true,
  },
];

const AppSidebar: React.FC = () => {
  const router = useRouter();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "support" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path)),
    [pathname]
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/signin");
      router.refresh();
    } catch {
      window.location.href = "/signin";
    }
  };

  const renderMenuItems = (
    items: NavItem[],
    menuType: "main" | "support" | "others"
  ) => (
    <ul className="flex flex-col gap-1.5">
      {items.map((nav, index) => (
        <li key={nav.key}>
          {nav.isLogout ? (
            <button
              onClick={handleLogout}
              className="group menu-item w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <span className="menu-item-icon-inactive text-red-500 group-hover:text-red-600">
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text font-medium text-red-500 group-hover:text-red-600">
                  {nav.label}
                </span>
              )}
            </button>
          ) : nav.path ? (
            <Link
              href={nav.path}
              className={cn(
                "group menu-item",
                isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
              )}
            >
              <span
                className={cn(
                  isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                )}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text font-medium">{nav.label}</span>
              )}
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out xl:mt-0 dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5"
      } ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } xl:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Header */}
      <div
        className={`flex py-6 ${
          !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xl shadow-md shadow-blue-500/30">
            D
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                devcore<span className="text-blue-500">.tr</span>
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-1">
                Yönetim Merkezi
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-5">
            <div>
              <h2
                className={`mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:text-center" : ""
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Yönetim Alanları" : "..."}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <h2
                className={`mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:text-center" : ""
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Sistem" : "..."}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>

      {/* Admin User Info Footer */}
      {(isExpanded || isHovered || isMobileOpen) && (
        <div className="border-t border-gray-200 p-3 mb-4 rounded-xl bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-600/20 text-blue-600 font-bold flex items-center justify-center text-sm">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                Admin
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                admin@devcore.tr
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
