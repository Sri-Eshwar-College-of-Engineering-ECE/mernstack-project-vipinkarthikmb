import { Sliders } from "lucide-react";
import { useState } from "react";

export default function SecurityCore() {
  const [sensitivity, setSensitivity] = useState(75);

  return (
    <Section title="Security Core" icon={<Sliders />}>
      <p className="text-xs text-gray-500 mb-6">
        Adjust detection sensitivity for threats and anomalies.
      </p>

      <div>
        <div className="flex justify-between text-xs font-bold mb-3">
          <span>Sensitivity</span>
          <span className="text-blue-400">{sensitivity}%</span>
        </div>

        <input
          type="range"
          value={sensitivity}
          onChange={(e) => setSensitivity(e.target.value)}
          className="w-full accent-blue-600"
        />
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
