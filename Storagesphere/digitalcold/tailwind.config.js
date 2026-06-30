export default {
content: ["./src/**/*.{js,jsx,ts,tsx}"],
theme: {
extend: {
colors: {
navy: "#0f172a",
industrialBlue: "#1e40af",
tealAccent: "#06b6d4",
violetGlow: "#8b5cf6",
success: "#10b981",
alert: "#f97316",
critical: "#ef4444",
slateDark: "#111827",
},
boxShadow: {
glass: "0 10px 30px rgba(2, 6, 23, 0.35)",
soft: "0 8px 20px rgba(15, 23, 42, 0.25)",
},
backgroundImage: {
dashboardGradient:
"linear-gradient(135deg, rgba(30,64,175,0.18) 0%, rgba(6,182,212,0.10) 45%, rgba(15,23,42,0.9) 100%)",
buttonGradient: "linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)",
heroGradient: "linear-gradient(120deg, rgba(6,182,212,0.35) 0%, rgba(139,92,246,0.22) 45%, rgba(30,64,175,0.18) 100%)",
surfaceGradient: "linear-gradient(160deg, rgba(15,23,42,0.75) 0%, rgba(17,24,39,0.95) 60%, rgba(30,64,175,0.22) 100%)",
},
keyframes: {
fadeIn: {
"0%": { opacity: 0, transform: "translateY(10px)" },
"100%": { opacity: 1, transform: "translateY(0)" },
},
slideIn: {
"0%": { opacity: 0, transform: "translateX(20px)" },
"100%": { opacity: 1, transform: "translateX(0)" },
},
pulseGlow: {
"0%, 100%": { boxShadow: "0 0 0 rgba(6,182,212,0)" },
"50%": { boxShadow: "0 0 18px rgba(6,182,212,0.35)" },
},
float: {
"0%, 100%": { transform: "translateY(0px)" },
"50%": { transform: "translateY(-6px)" },
},
shimmer: {
"0%": { backgroundPosition: "-200% 0" },
"100%": { backgroundPosition: "200% 0" },
},
},
animation: {
fadeIn: "fadeIn 400ms ease-out",
slideIn: "slideIn 500ms ease-out",
pulseGlow: "pulseGlow 1800ms ease-in-out infinite",
float: "float 4s ease-in-out infinite",
shimmer: "shimmer 3s linear infinite",
},
},
},
plugins: [],
}