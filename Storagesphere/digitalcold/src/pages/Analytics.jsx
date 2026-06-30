import { useMemo, useState } from 'react'
import ChartCard from '../components/ChartComponent'

const analyticsRows = [
	{ date: '2026-02-18', temperature: 3.2, humidity: 58 },
	{ date: '2026-02-19', temperature: 3.4, humidity: 57 },
	{ date: '2026-02-20', temperature: 3.1, humidity: 60 },
	{ date: '2026-02-21', temperature: 3.7, humidity: 63 },
	{ date: '2026-02-22', temperature: 3.9, humidity: 61 },
	{ date: '2026-02-23', temperature: 4.1, humidity: 64 },
	{ date: '2026-02-24', temperature: 3.8, humidity: 62 },
]

const requiredColumns = [
	'temperature_C',
	'humidity_percent',
	'door_open_duration_min',
	'door_frequency_per_hour',
	'storage_hours',
]

const initialDeviceForm = {
	name: '',
	channelId: '',
	readApiKey: '',
	results: 20,
}

function Analytics() {
	const [fromDate, setFromDate] = useState('2026-02-18')
	const [toDate, setToDate] = useState('2026-02-24')
	const [deviceForm, setDeviceForm] = useState(initialDeviceForm)
	const [devices, setDevices] = useState([])
	const [selectedDeviceId, setSelectedDeviceId] = useState('')
	const [deviceRowsById, setDeviceRowsById] = useState({})
	const [deviceLoadingById, setDeviceLoadingById] = useState({})
	const [deviceError, setDeviceError] = useState('')

	const filtered = useMemo(
		() => analyticsRows.filter((row) => row.date >= fromDate && row.date <= toDate),
		[fromDate, toDate],
	)

	const selectedDeviceRows = useMemo(() => {
		if (!selectedDeviceId) return []
		return deviceRowsById[selectedDeviceId] || []
	}, [selectedDeviceId, deviceRowsById])

	const analyticsData = useMemo(() => {
		if (selectedDeviceRows.length > 0) {
			return selectedDeviceRows.map((row) => ({
				date: row.created_at.slice(0, 10),
				temperature: row.temperature_C,
				humidity: row.humidity_percent,
			}))
		}

		return filtered
	}, [selectedDeviceRows, filtered])

	const summary = useMemo(() => {
		if (!analyticsData.length) return { avgTemp: 0, avgHum: 0, highRiskDays: 0 }
		const avgTemp = analyticsData.reduce((sum, row) => sum + row.temperature, 0) / analyticsData.length
		const avgHum = analyticsData.reduce((sum, row) => sum + row.humidity, 0) / analyticsData.length
		const highRiskDays = analyticsData.filter((row) => row.temperature > 4 || row.humidity > 62).length
		return { avgTemp, avgHum, highRiskDays }
	}, [analyticsData])

	const onDeviceFormChange = (event) => {
		const { name, value } = event.target
		setDeviceForm((prev) => ({
			...prev,
			[name]: name === 'results' ? Number(value) : value,
		}))
	}

	const addDevice = () => {
		setDeviceError('')
		if (!deviceForm.channelId.trim()) {
			setDeviceError('Channel ID is required to add a ThingSpeak device.')
			return
		}

		const deviceId = `${deviceForm.channelId.trim()}-${Date.now()}`
		const newDevice = {
			id: deviceId,
			name: deviceForm.name.trim() || `Device ${devices.length + 1}`,
			channelId: deviceForm.channelId.trim(),
			readApiKey: deviceForm.readApiKey.trim(),
			results: Math.max(1, Math.min(200, Number(deviceForm.results) || 20)),
		}

		setDevices((prev) => [...prev, newDevice])
		if (!selectedDeviceId) {
			setSelectedDeviceId(deviceId)
		}
		setDeviceForm(initialDeviceForm)
	}

	const removeDevice = (deviceId) => {
		setDevices((prev) => prev.filter((device) => device.id !== deviceId))
		setDeviceRowsById((prev) => {
			const next = { ...prev }
			delete next[deviceId]
			return next
		})
		if (selectedDeviceId === deviceId) {
			const nextDevice = devices.find((device) => device.id !== deviceId)
			setSelectedDeviceId(nextDevice?.id || '')
		}
	}

	const fetchDeviceData = async (device) => {
		setDeviceError('')
		setDeviceLoadingById((prev) => ({ ...prev, [device.id]: true }))

		try {
			const params = new URLSearchParams({
				results: String(device.results),
			})

			if (device.readApiKey) {
				params.append('api_key', device.readApiKey)
			}

			const url = `https://api.thingspeak.com/channels/${device.channelId}/feeds.json?${params.toString()}`
			const response = await fetch(url)

			if (!response.ok) {
				throw new Error(`Unable to fetch device ${device.name}. Verify key/channel settings.`)
			}

			const payload = await response.json()
			const normalizedRows = (payload.feeds || [])
				.map((feed) => ({
					created_at: feed.created_at,
					temperature_C: Number(feed.field1),
					humidity_percent: Number(feed.field2),
					door_open_duration_min: Number(feed.field3),
					door_frequency_per_hour: Number(feed.field4),
					storage_hours: Number(feed.field5),
				}))
				.filter((row) => !requiredColumns.some((column) => Number.isNaN(row[column])))

			setDeviceRowsById((prev) => ({ ...prev, [device.id]: normalizedRows }))
			setSelectedDeviceId(device.id)
		} catch (error) {
			setDeviceError(error.message || 'Failed to load ThingSpeak data.')
		} finally {
			setDeviceLoadingById((prev) => ({ ...prev, [device.id]: false }))
		}
	}

	const handleExportCsv = () => {
		if (selectedDeviceRows.length > 0) {
			const header = ['device', 'timestamp', ...requiredColumns].join(',')
			const activeDevice = devices.find((device) => device.id === selectedDeviceId)
			const rows = selectedDeviceRows.map((row) => [
				activeDevice?.name || 'ThingSpeakDevice',
				row.created_at,
				...requiredColumns.map((field) => row[field]),
			])
			const csvRows = [header, ...rows.map((row) => row.join(','))]
			const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
			const url = URL.createObjectURL(blob)
			const anchor = document.createElement('a')
			anchor.href = url
			anchor.download = `storagesphere-analytics-${activeDevice?.name || 'thingspeak'}.csv`
			anchor.click()
			URL.revokeObjectURL(url)
			return
		}

		const csvRows = ['date,temperature,humidity', ...filtered.map((row) => `${row.date},${row.temperature},${row.humidity}`)]
		const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const anchor = document.createElement('a')
		anchor.href = url
		anchor.download = `storagesphere-analytics-${fromDate}-to-${toDate}.csv`
		anchor.click()
		URL.revokeObjectURL(url)
	}

	return (
		<div className="space-y-6 animate-fadeIn">
			<section className="neo-panel p-6">
				<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div>
						<h2 className="text-2xl font-semibold text-white">ThingSpeak Device Analytics</h2>
						<p className="mt-1 text-sm text-slate-400">Add multiple devices, fetch live graph data using channel ID and updated API key, then download CSV.</p>
					</div>
					<div className="text-xs text-slate-400">Field map: field1→temperature_C, field2→humidity_percent, field3→door_open_duration_min, field4→door_frequency_per_hour, field5→storage_hours</div>
				</div>

				<div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
					<input
						name="name"
						value={deviceForm.name}
						onChange={onDeviceFormChange}
						placeholder="Device name"
						className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
					/>
					<input
						name="channelId"
						value={deviceForm.channelId}
						onChange={onDeviceFormChange}
						placeholder="ThingSpeak channel ID"
						className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
					/>
					<input
						name="readApiKey"
						value={deviceForm.readApiKey}
						onChange={onDeviceFormChange}
						placeholder="Read API key (optional)"
						className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
					/>
					<div className="flex gap-2">
						<input
							name="results"
							type="number"
							min="1"
							max="200"
							value={deviceForm.results}
							onChange={onDeviceFormChange}
							placeholder="Records"
							className="w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
						/>
						<button type="button" className="gradient-btn" onClick={addDevice}>
							Add Device
						</button>
					</div>
				</div>

				{deviceError && <p className="mt-3 text-sm text-alert">{deviceError}</p>}

				{devices.length > 0 && (
					<div className="mt-4 space-y-2">
						{devices.map((device) => (
							<div key={device.id} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3 md:flex-row md:items-center md:justify-between">
								<div>
									<p className="font-semibold text-white">{device.name}</p>
									<p className="text-xs text-slate-400">Channel: {device.channelId}</p>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<button
										type="button"
										className="rounded-lg border border-white/25 px-3 py-1.5 text-sm text-white transition hover:border-tealAccent"
										onClick={() => setSelectedDeviceId(device.id)}
									>
										Select
									</button>
									<button
										type="button"
										className="rounded-lg border border-tealAccent/40 px-3 py-1.5 text-sm text-tealAccent transition hover:border-tealAccent"
										onClick={() => fetchDeviceData(device)}
										disabled={Boolean(deviceLoadingById[device.id])}
									>
										{deviceLoadingById[device.id] ? 'Fetching...' : 'Fetch Graph Data'}
									</button>
									<button
										type="button"
										className="rounded-lg border border-alert/40 px-3 py-1.5 text-sm text-alert transition hover:border-alert"
										onClick={() => removeDevice(device.id)}
									>
										Remove
									</button>
									{selectedDeviceId === device.id && <span className="text-xs text-tealAccent">Active</span>}
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			<section className="neo-panel p-6">
				<h2 className="text-2xl font-semibold text-white">Analytics & Reports</h2>
				<p className="mt-1 text-sm text-slate-400">Generate trend reports, review risk patterns, and export historical monitoring data.</p>

				<div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
					<div>
						<label className="mb-2 block text-sm text-slate-300">From</label>
						<input
							type="date"
							value={fromDate}
							onChange={(e) => setFromDate(e.target.value)}
							className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
						/>
					</div>
					<div>
						<label className="mb-2 block text-sm text-slate-300">To</label>
						<input
							type="date"
							value={toDate}
							onChange={(e) => setToDate(e.target.value)}
							className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
						/>
					</div>
					<div className="md:col-span-2 flex items-end">
						<button type="button" className="gradient-btn w-full md:w-auto" onClick={handleExportCsv}>
							Export CSV
						</button>
					</div>
				</div>
			</section>

			<section className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="neo-panel p-4">
					<p className="text-xs text-slate-400">Report Window</p>
					<p className="mt-2 text-xl font-bold text-white">{analyticsData.length} records</p>
					<p className="mt-1 text-xs text-slate-400">{selectedDeviceRows.length ? 'Fetched from selected ThingSpeak device' : 'Filtered from selected range'}</p>
				</div>
				<div className="neo-panel p-4">
					<p className="text-xs text-slate-400">Risk Trigger Conditions</p>
					<p className="mt-2 text-xl font-bold text-white">T &gt; 4°C / H &gt; 62%</p>
					<p className="mt-1 text-xs text-alert">Auto-flagged in summary</p>
				</div>
				<div className="neo-panel p-4">
					<p className="text-xs text-slate-400">Data Export</p>
					<p className="mt-2 text-xl font-bold text-white">CSV Ready</p>
					<p className="mt-1 text-xs text-tealAccent">For audits and external analysis</p>
				</div>
			</section>

			<ChartCard
				title="Average Temperature by Day"
				labels={analyticsData.map((row) => row.date.slice(5))}
				data={analyticsData.map((row) => row.temperature)}
				lineColor="#06b6d4"
			/>

			<ChartCard
				title="Average Humidity by Day"
				labels={analyticsData.map((row) => row.date.slice(5))}
				data={analyticsData.map((row) => row.humidity)}
				lineColor="#14b8a6"
			/>

			<section className="neo-panel p-6">
				<h3 className="text-lg font-semibold text-white">Summary Report</h3>
				<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="rounded-xl border border-white/10 bg-white/5 p-4">
						<p className="text-xs text-slate-400">Avg Temperature</p>
						<p className="mt-2 text-xl font-bold text-white">{summary.avgTemp.toFixed(2)}°C</p>
					</div>
					<div className="rounded-xl border border-white/10 bg-white/5 p-4">
						<p className="text-xs text-slate-400">Avg Humidity</p>
						<p className="mt-2 text-xl font-bold text-white">{summary.avgHum.toFixed(2)}%</p>
					</div>
					<div className="rounded-xl border border-white/10 bg-white/5 p-4">
						<p className="text-xs text-slate-400">High Risk Days</p>
						<p className="mt-2 text-xl font-bold text-white">{summary.highRiskDays}</p>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Analytics
