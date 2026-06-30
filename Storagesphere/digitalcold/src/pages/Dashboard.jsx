import AlertList, { StorageTable } from '../components/AlertList'
import ChartCard from '../components/ChartComponent'
import KPIcard from '../components/KPIcard'

const hourlyLabels = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

const mockAlerts = [
	{
		id: 'a1',
		unitName: 'Unit A - Frozen Goods',
		message: 'Temperature exceeded threshold for 18 minutes',
		severity: 'high',
		timestamp: '24 Feb 2026, 11:12 AM',
	},
	{
		id: 'a2',
		unitName: 'Unit C - Dairy',
		message: 'Humidity deviation detected',
		severity: 'medium',
		timestamp: '24 Feb 2026, 12:48 PM',
	},
]

const mockTable = [
	{ id: 1, unitName: 'Unit A - Frozen Goods', location: 'Hyderabad', temperature: -16.8, humidity: 48, status: 'critical' },
	{ id: 2, unitName: 'Unit B - Produce', location: 'Vijayawada', temperature: 4.2, humidity: 63, status: 'safe' },
	{ id: 3, unitName: 'Unit C - Dairy', location: 'Nellore', temperature: 2.9, humidity: 72, status: 'warning' },
	{ id: 4, unitName: 'Unit D - Pharma', location: 'Warangal', temperature: 6.1, humidity: 58, status: 'safe' },
]

function Dashboard() {
	return (
		<div className="space-y-6 animate-fadeIn">
			<section className="neo-panel overflow-hidden p-6">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
					<div className="lg:col-span-2">
						<p className="text-xs uppercase tracking-[0.2em] text-tealAccent">Live Command Center</p>
						<h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Keep Every Cold Unit Under Control</h2>
						<p className="mt-2 max-w-2xl text-sm text-slate-300">Use one dashboard to monitor stability, spot early risk, and respond faster to thresholds across all facilities.</p>
					</div>
					<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center animate-float">
						<p className="text-xs text-slate-400">Fleet Health Score</p>
						<p className="mt-2 text-4xl font-black text-tealAccent">92%</p>
						<p className="mt-1 text-xs text-success">+3.1% from last week</p>
					</div>
				</div>
			</section>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				<KPIcard title="Total Units" value="24" trend="+2 units this month" accent="teal" />
				<KPIcard title="Active Alerts" value="7" trend="2 high severity alerts" accent="orange" />
				<KPIcard title="Avg Temperature" value="3.8" unit="°C" trend="Stable in last 24h" accent="blue" />
				<KPIcard title="Avg Humidity" value="61" unit="%" trend="+4% from yesterday" accent="green" />
			</div>

			<section className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="neo-panel p-4">
					<p className="text-xs text-slate-400">Most Critical Unit</p>
					<p className="mt-2 text-lg font-semibold text-white">Unit A - Frozen Goods</p>
					<p className="mt-1 text-sm text-alert">Temperature deviation: 18 mins</p>
				</div>
				<div className="neo-panel p-4">
					<p className="text-xs text-slate-400">Response Time</p>
					<p className="mt-2 text-lg font-semibold text-white">12 minutes</p>
					<p className="mt-1 text-sm text-success">Below SLA target</p>
				</div>
				<div className="neo-panel p-4">
					<p className="text-xs text-slate-400">AI Risk Window</p>
					<p className="mt-2 text-lg font-semibold text-white">Next 6 hours</p>
					<p className="mt-1 text-sm text-tealAccent">7 units need closer watch</p>
				</div>
			</section>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<ChartCard
					title="Temperature Trend"
					labels={hourlyLabels}
					data={[-18, -17.2, -16.8, -15.9, -15.4, -15.1, -16.2, -16.8, -17.1, -16.6, -16.1, -15.8]}
					lineColor="#06b6d4"
				/>
				<ChartCard
					title="Humidity Trend"
					labels={hourlyLabels}
					data={[52, 54, 57, 60, 58, 59, 63, 66, 62, 60, 58, 57]}
					lineColor="#10b981"
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
				<div className="2xl:col-span-1">
					<AlertList alerts={mockAlerts} />
				</div>
				<div className="2xl:col-span-2">
					<StorageTable rows={mockTable} />
				</div>
			</div>
		</div>
	)
}

export default Dashboard
