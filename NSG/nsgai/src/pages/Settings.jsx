import React, { useState } from "react";
import {
  ShieldCheck,
  Eye,
  Database,
  UserCog,
  Cpu
} from "lucide-react";

import SecurityCore from "../settings/SecurityCore";
import AIModels from "../settings/AIModels";
import Storage from "../settings/Storage";
import AuthProtocol from "../settings/AuthProtocol";

export default function BSG_Settings() {
  const [activeSection, setActiveSection] = useState("security");

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 flex">

      {/* LEFT SIDEBAR */}
      <aside className="w-72 bg-[#05070A] border-r border-white/5 p-8 flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded">
            <Cpu size={18} />
          </div>
          <h2 className="font-black tracking-widest italic">GRID CFG</h2>
        </div>

        <nav className="space-y-2 mt-6">
          <NavButton
            icon={<ShieldCheck size={18} />}
            label="Security Core"
            active={activeSection === "security"}
            onClick={() => setActiveSection("security")}
          />

          <NavButton
            icon={<Eye size={18} />}
            label="AI Models"
            active={activeSection === "ai"}
            onClick={() => setActiveSection("ai")}
          />

          <NavButton
            icon={<Database size={18} />}
            label="Storage"
            active={activeSection === "storage"}
            onClick={() => setActiveSection("storage")}
          />

          <NavButton
            icon={<UserCog size={18} />}
            label="Auth Protocol"
            active={activeSection === "auth"}
            onClick={() => setActiveSection("auth")}
          />
        </nav>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto">
        {activeSection === "security" && <SecurityCore />}
        {activeSection === "ai" && <AIModels />}
        {activeSection === "storage" && <Storage />}
        {activeSection === "auth" && <AuthProtocol />}
      </main>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm font-bold
      ${active
        ? "bg-white/5 border border-white/10 text-white"
        : "text-gray-500 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
