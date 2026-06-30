import { Database } from "lucide-react";
import { useState } from "react";

export default function Storage() {
  const [storageUsed, setStorageUsed] = useState(65);

  return (
    <Section title="Storage" icon={<Database />}>
      <p className="text-xs text-gray-500 mb-6">
        Manage surveillance footage storage and archival settings.
      </p>

      <div>
        <div className="flex justify-between text-xs font-bold mb-3">
          <span>Storage Usage</span>
          <span className="text-green-400">{storageUsed}%</span>
        </div>

        <div className="w-full bg-black/50 rounded-lg h-2 overflow-hidden border border-white/10 mb-6">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500" 
            style={{ width: `${storageUsed}%` }}
          />
        </div>

        <div className="text-xs text-gray-400 space-y-2">
          <p>• Total Capacity: 2TB</p>
          <p>• Used: {Math.round(2 * storageUsed / 100)}TB</p>
          <p>• Remaining: {Math.round(2 * (100 - storageUsed) / 100)}TB</p>
        </div>
      </div>
    </Section>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-[#0A0C12] border border-white/5 p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="font-black uppercase text-sm tracking-widest">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
