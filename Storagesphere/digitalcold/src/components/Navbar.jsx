function Navbar({ title, onMenuClick, onLogout, userName }) {
	return (
		<header className="neo-panel mb-6 flex h-20 items-center justify-between px-4 md:px-6">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onMenuClick}
					className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10 lg:hidden"
				>
					☰
				</button>
				<div>
					<h2 className="text-lg font-semibold text-white md:text-xl">{title}</h2>
					<p className="text-xs text-slate-400">StorageSphere • Enterprise Monitoring</p>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<span className="hidden rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-medium text-success md:inline-flex">
					Live Monitoring
				</span>
				<span className="hidden rounded-full border border-tealAccent/40 bg-tealAccent/10 px-3 py-1 text-xs font-medium text-tealAccent md:inline-flex">
					AI Active
				</span>
				<span className="hidden text-sm text-slate-300 md:inline">{userName}</span>
				<button type="button" className="gradient-btn text-sm" onClick={onLogout}>
					Logout
				</button>
			</div>
		</header>
	)
}

export default Navbar
