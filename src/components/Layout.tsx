import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Grid,
  AlertTriangle,
  Car,
  User,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFamily } from "@/context/FamilyContext";
import { useState, useEffect } from "react";

import { Logo } from "./Logo";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { members, activeMember, setActiveMember } = useFamily();
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Ana Sayfa", path: "/home" },
    { icon: ShieldCheck, label: "Sigorta & Teklifler", path: "/insurance" },
    { icon: Car, label: "Varlıklarım", path: "/garage" },
    { icon: Grid, label: "Hizmetler", path: "/services" },
    { icon: User, label: "Ailem & Profil", path: "/profile" },
  ];

  const currentMemberName = activeMember?.name || "Sürücü";
  const currentMemberRole = activeMember?.role || "self";
  const currentMemberAvatarColor =
    activeMember?.avatarColor || "from-[#00E5FF] to-blue-600";

  const getRoleLabel = (role?: string) => {
    if (role === "self") return "Kendim";
    if (role === "spouse") return "Eşim";
    if (role === "child") return "Çocuğum";
    return "Ebeveynim";
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (location.pathname === "/" || location.pathname === "/sos-active") {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-[#0A1128] text-white overflow-hidden relative">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-72 bg-[#1A233A] border-r border-white/10 flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 pb-4">
          <div className="mb-8">
            <Logo textClassName="text-2xl" iconSize="w-10 h-10" />
          </div>

          <div className="relative mb-6">
            <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-medium">
              İşlem Yapılan Kişi
            </p>

            <button
              onClick={() => {
                if (members.length > 0) {
                  setShowFamilyDropdown(!showFamilyDropdown);
                }
              }}
              className="w-full flex items-center justify-between p-3 bg-[#0A1128] rounded-xl border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentMemberAvatarColor} flex items-center justify-center`}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">
                    {currentMemberName}
                  </p>
                  <p className="text-xs text-white/50 capitalize">
                    {getRoleLabel(currentMemberRole)}
                  </p>
                </div>
              </div>

              {members.length > 0 && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-white/50 transition-transform",
                    showFamilyDropdown && "rotate-180"
                  )}
                />
              )}
            </button>

            {showFamilyDropdown && members.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#2A3B5C] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                {members.map((member) => {
                  const isSelected = activeMember?.id === member.id;

                  return (
                    <button
                      key={member.id}
                      onClick={() => {
                        setActiveMember(member);
                        setShowFamilyDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left",
                        isSelected && "bg-white/5"
                      )}
                    >
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${member.avatarColor} flex items-center justify-center`}
                      >
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {member.name}
                        </p>
                        <p className="text-xs text-white/50 capitalize">
                          {getRoleLabel(member.role)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group",
                  isActive
                    ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive
                      ? "text-[#00E5FF]"
                      : "text-white/40 group-hover:text-white/80"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-white/10">
          <button
            onClick={() => {
              navigate("/sos");
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-[#FF3D00] text-white shadow-[0_0_20px_rgba(255,61,0,0.3)] hover:bg-[#FF3D00]/90 transition-all active:scale-95 font-bold tracking-wide"
          >
            <AlertTriangle className="w-5 h-5" strokeWidth={2.5} />
            ACİL DURUM (SOS)
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-[#0A1128] flex flex-col">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#1A233A] sticky top-0 z-30">
          <Logo textClassName="text-xl" iconSize="w-8 h-8" />
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-white/80 hover:text-white bg-white/5 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00E5FF]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 min-h-full w-full flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}