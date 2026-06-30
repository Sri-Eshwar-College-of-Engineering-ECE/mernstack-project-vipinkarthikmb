import { useMemo, useState } from 'react'
import { AlertCard } from '../components/AlertList'

const allAlerts = [
	{ id: 'al1', unitName: 'Unit A - Frozen Goods', message: 'Critical temperature drift detected', severity: 'high', timestamp: '24 Feb 2026, 11:12 AM' },
	{ id: 'al2', unitName: 'Unit B - Produce', message: 'Humidity above threshold for 10 minutes', severity: 'medium', timestamp: '24 Feb 2026, 10:03 AM' },
	{ id: 'al3', unitName: 'Unit D - Pharma', message: 'Sensor connectivity restored', severity: 'low', timestamp: '24 Feb 2026, 09:40 AM' },
	{ id: 'al4', unitName: 'Unit C - Dairy', message: 'Continuous deviation over 20 minutes', severity: 'high', timestamp: '23 Feb 2026, 06:05 PM' },
]

function AlertsPage() {
	
	const [filter, setFilter] = useState('all')
	
	const alerts = useMemo(() => {
		if (filter === 'all') return allAlerts
		return allAlerts.filter((alert) => alert.severity === filter)
	}, [filter])

	return (
		<div className="space-y-6 animate-fadeIn">
			<section className="neo-panel p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h2 className="text-2xl font-bold text-white">Alerts Center</h2>
						<p className="mt-1 text-sm text-slate-400">Track and filter operational warnings across all storage units.</p>
					</div>

					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
					>
						<option value="all" className="text-slate-900">All Severities</option>
						<option value="high" className="text-slate-900">High</option>
						<option value="medium" className="text-slate-900">Medium</option>
						<option value="low" className="text-slate-900">Low</option>
					</select>
				</div>
			</section>

			<section className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="neo-panel p-4">
					<p className="text-xs text-slate-400">Total Alerts</p>
					<p className="mt-2 text-2xl font-bold text-white">{allAlerts.length}</p>
					<p className="mt-1 text-xs text-slate-400">Across latest operations window</p>
				</div>
				<div className="neo-panel p-4">
					<p className="text-xs text-slate-400">High Severity</p>
					<p className="mt-2 text-2xl font-bold text-critical">{allAlerts.filter((alert) => alert.severity === 'high').length}</p>
					<p className="mt-1 text-xs text-critical">Requires immediate action</p>
				</div>
				<div className="neo-panel p-4">
					<p className="text-xs text-slate-400">Medium Severity</p>
					<p className="mt-2 text-2xl font-bold text-alert">{allAlerts.filter((alert) => alert.severity === 'medium').length}</p>
					<p className="mt-1 text-xs text-alert">Monitor and validate quickly</p>
				</div>
			</section>

			<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				{alerts.map((alert) => (
					<AlertCard key={alert.id} alert={alert} />
				))}
			</div>
		</div>
	)
}

export default AlertsPage