function KPIcard({ title, value, trend, accent = 'tealAccent', unit = '' }) {
	const accentDot = {
		teal: 'bg-tealAccent',
		blue: 'bg-industrialBlue',
		orange: 'bg-alert',
		green: 'bg-success',
		red: 'bg-critical',
	}[accent] || 'bg-tealAccent'

	return (
		<div className="neo-panel animate-fadeIn p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm text-slate-400">{title}</p>
					<h3 className="mt-2 text-2xl font-bold text-white">
						{value}
						{unit}
					</h3>
				</div>
				<span className={`h-3 w-3 rounded-full ${accentDot} animate-pulseGlow`} />
			</div>
			<p className="mt-4 text-xs text-slate-200">{trend}</p>
		</div>
	)
}

export default KPIcard
