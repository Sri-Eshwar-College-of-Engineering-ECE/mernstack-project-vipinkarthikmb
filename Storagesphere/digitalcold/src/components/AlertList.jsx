import { StatusBadge } from './RiskIndicator'

const severityStyles = {
	low: 'border-tealAccent/40 bg-tealAccent/10 text-tealAccent',
	medium: 'border-alert/40 bg-alert/10 text-alert',
	high: 'border-critical/40 bg-critical/10 text-critical',
}

export function AlertCard({ alert }) {
	const level = String(alert.severity || 'low').toLowerCase()
	const style = severityStyles[level] || severityStyles.low

	return (
		<article className="neo-panel animate-slideIn border-l-4 border-l-alert p-4 transition hover:-translate-y-1 hover:shadow-soft">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="font-semibold text-white">{alert.message}</p>
					<p className="mt-1 text-xs text-slate-400">{alert.unitName}</p>
					<p className="mt-1 text-xs text-slate-500">{alert.timestamp}</p>
				</div>
				<span className={`rounded-full border px-2 py-1 text-xs font-semibold uppercase ${style}`}>{level}</span>
			</div>
		</article>
	)
}

export function StorageTable({ rows }) {
	return (
		<section className="neo-panel overflow-hidden p-0">
			<div className="border-b border-white/10 px-5 py-4">
				<h3 className="text-base font-semibold text-white">Storage Status</h3>
			</div>
			<div className="overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead className="bg-white/5 text-slate-300">
						<tr>
							<th className="px-4 py-3 text-left font-medium">Unit</th>
							<th className="px-4 py-3 text-left font-medium">Location</th>
							<th className="px-4 py-3 text-left font-medium">Temperature</th>
							<th className="px-4 py-3 text-left font-medium">Humidity</th>
							<th className="px-4 py-3 text-left font-medium">Status</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr key={row.id} className="border-t border-white/10 text-slate-200 transition hover:bg-white/5">
								<td className="px-4 py-3">{row.unitName}</td>
								<td className="px-4 py-3">{row.location}</td>
								<td className="px-4 py-3">{row.temperature}°C</td>
								<td className="px-4 py-3">{row.humidity}%</td>
								<td className="px-4 py-3">
									<StatusBadge status={row.status} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	)
}

function AlertList({ alerts }) {
	return (
		<section className="neo-panel p-4">
			<h3 className="mb-3 text-base font-semibold text-white">Alerts Panel</h3>
			<div className="space-y-3">
				{alerts.map((alert) => (
					<AlertCard key={alert.id} alert={alert} />
				))}
			</div>
		</section>
	)
}

export default AlertList
