import { NavLink } from 'react-router-dom'

const links = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Storage Details', to: '/storage' },
    { label: 'Alerts', to: '/alerts' },
    { label: 'Analytics', to: '/analytics' },
]

function Sidebar({ isCollapsed, setIsCollapsed, isOpen, setIsOpen }) {
    return (
        <>
            {/* Mobile Overlay: Only visible when sidebar is open on small screens */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl transition-all duration-300 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${isCollapsed ? 'w-20' : 'w-72'}`}
            >
                {/* Header Section */}
                <div className="flex h-24 items-center justify-between border-b border-white/5 px-6">
                    <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        <h1 className="shimmer-text text-xl font-black tracking-tighter">StorageSphere</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Cold Chain OS</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCollapsed((prev) => !prev)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-tealAccent/20 hover:text-tealAccent"
                    >
                        <span className="text-lg">{isCollapsed ? '»' : '«'}</span>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar p-4">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `group flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                                    isActive
                                        ? 'bg-tealAccent/10 text-tealAccent shadow-[inset_0_0_12px_rgba(45,212,191,0.1)]'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            {/* Neon Indicator Dot */}
                            <span className={`mr-4 h-1.5 w-1.5 rounded-full transition-all duration-300 group-hover:shadow-[0_0_8px_#2dd4bf] ${
                                isCollapsed ? 'mx-auto mr-0' : ''
                            } bg-tealAccent`} />
                            
                            {!isCollapsed && (
                                <span className="tracking-wide">{link.label}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Footer - Always at bottom */}
                <div className="border-t border-white/5 p-6">
                    <div className={`rounded-xl bg-white/5 p-4 transition-all ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        <p className="text-[10px] uppercase text-slate-500 font-bold">Node Status</p>
                        <div className="mt-1 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-tealAccent" />
                            <span className="text-xs font-bold text-white uppercase tracking-tighter">0x442-Safe</span>
                        </div>
                    </div>
                </div>
            </aside>
            
            {/* Spacer for desktop layout: This prevents the content from hiding behind the fixed sidebar */}
            <div className={`hidden transition-all duration-300 lg:block ${isCollapsed ? 'w-20' : 'w-72'}`} />
        </>
    )
}

export default Sidebar