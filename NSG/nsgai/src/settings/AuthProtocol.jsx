import { UserCog } from "lucide-react";

export default function AuthProtocol() {
  return (
    <Section title="Auth Protocol" icon={<UserCog />}>
      <input
        className="w-full bg-black border border-white/10 p-3 rounded-lg mb-4"
        placeholder="Admin Callsign"
      />
      <input
        type="password"
        className="w-full bg-black border border-white/10 p-3 rounded-lg"
        placeholder="Encryption Key"
      />
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
