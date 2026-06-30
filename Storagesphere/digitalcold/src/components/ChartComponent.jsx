import {
	CategoryScale,
	Chart as ChartJS,
	Filler,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const baseOptions = {
	responsive: true,
	maintainAspectRatio: false,
	interaction: { mode: 'index', intersect: false },
	plugins: {
		legend: {
			labels: { color: '#cbd5e1' },
		},
	},
	scales: {
		x: {
			ticks: { color: '#94a3b8' },
			grid: { color: 'rgba(148, 163, 184, 0.12)' },
		},
		y: {
			ticks: { color: '#94a3b8' },
			grid: { color: 'rgba(148, 163, 184, 0.12)' },
		},
	},
}

export function ChartCard({ title, labels, data, lineColor }) {
	const chartData = {
		labels,
		datasets: [
			{
				label: title,
				data,
				borderColor: lineColor,
				backgroundColor: `${lineColor}33`,
				fill: true,
				tension: 0.35,
				pointRadius: 3,
			},
		],
	}

	return (
		<section className="neo-panel animate-fadeIn p-5">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-base font-semibold text-white">{title}</h3>
				<span className="text-xs text-tealAccent">Last 12 readings</span>
			</div>
			<div className="h-72">
				<Line data={chartData} options={baseOptions} />
			</div>
		</section>
	)
}

export default ChartCard
