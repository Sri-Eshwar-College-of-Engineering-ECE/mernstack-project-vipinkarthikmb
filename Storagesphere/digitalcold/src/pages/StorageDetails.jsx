import { useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import apiClient from '../api/axios'
import ChartCard from '../components/ChartComponent'
import { StatusBadge } from '../components/RiskIndicator'

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const requiredColumns = [
	'temperature_C',
	'humidity_percent',
	'door_open_duration_min',
	'door_frequency_per_hour',
	'storage_hours',
]

const initialFormData = {
	temperature_C: '',
	humidity_percent: '',
	door_open_duration_min: '',
	door_frequency_per_hour: '',
	storage_hours: '',
}

function StorageDetails() {
	const [formData, setFormData] = useState(initialFormData)
	const [prediction, setPrediction] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [csvFileName, setCsvFileName] = useState('')
	const [csvUploadLoading, setCsvUploadLoading] = useState(false)
	const [csvUploadError, setCsvUploadError] = useState('')
	const [csvResult, setCsvResult] = useState(null)

	const isFormValid = useMemo(() => Object.values(formData).every((value) => value !== ''), [formData])

	const onFieldChange = (event) => {
		const { name, value } = event.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}


	const parseCsvRows = async (file) => {
		const text = await file.text()
		const lines = text
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean)

		if (lines.length < 2) {
			throw new Error('CSV must include a header row and at least one data row.')
		}

		const headerColumns = lines[0].split(',').map((column) => column.trim())

		const missingColumns = requiredColumns.filter((column) => !headerColumns.includes(column))
		if (missingColumns.length > 0) {
			throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
		}

		const rows = lines.slice(1).map((line, index) => {
			const values = line.split(',').map((value) => value.trim())
			const rowData = Object.fromEntries(headerColumns.map((column, valueIndex) => [column, values[valueIndex] ?? '']))

			const parsed = {
				temperature_C: Number(rowData.temperature_C),
				humidity_percent: Number(rowData.humidity_percent),
				door_open_duration_min: Number(rowData.door_open_duration_min),
				door_frequency_per_hour: Number(rowData.door_frequency_per_hour),
				storage_hours: Number(rowData.storage_hours),
			}

			if (Object.values(parsed).some((value) => Number.isNaN(value))) {
				throw new Error(`Invalid numeric value found in CSV row ${index + 2}.`)
			}

			return parsed
		})

		return rows
	}

	const handlePredict = async () => {
		setError('')
		setPrediction(null)
		setIsLoading(true)

		try {
			const payload = {
				temperature_C: Number(formData.temperature_C),
				humidity_percent: Number(formData.humidity_percent),
				door_open_duration_min: Number(formData.door_open_duration_min),
				door_frequency_per_hour: Number(formData.door_frequency_per_hour),
				storage_hours: Number(formData.storage_hours),
			}

			const { data } = await apiClient.post('/sensor/predict', payload)
			setPrediction(data)
		} catch (apiError) {
			setError(apiError.response?.data?.message || 'Unable to get AI prediction right now.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleDownloadPdf = () => {
		if (!prediction) return

		const report = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
		const pageWidth = report.internal.pageSize.getWidth()
		let cursorY = 16

		report.setFont('helvetica', 'bold')
		report.setFontSize(18)
		report.text('StorageSphere web app', pageWidth / 2, cursorY, { align: 'center' })

		cursorY += 8
		report.setFont('helvetica', 'normal')
		report.setFontSize(11)
		report.text(`Generated on: ${new Date().toLocaleString()}`, 14, cursorY)
		cursorY += 8

		report.setDrawColor(200, 200, 200)
		report.line(14, cursorY, pageWidth - 14, cursorY)
		cursorY += 7

		report.setFont('helvetica', 'bold')
		report.setFontSize(13)
		report.text('DATA', 14, cursorY)
		cursorY += 7

		report.setFont('helvetica', 'normal')
		report.setFontSize(11)
		requiredColumns.forEach((field) => {
			report.text(`${field}: ${prediction[field]}`, 16, cursorY)
			cursorY += 6
		})

		cursorY += 4
		report.setFont('helvetica', 'bold')
		report.setFontSize(13)
		report.text('RESULT', 14, cursorY)
		cursorY += 7

		report.setFont('helvetica', 'normal')
		report.setFontSize(11)
		report.text(`risk_score: ${Number(prediction.risk_score).toFixed(2)}%`, 16, cursorY)
		cursorY += 6
		report.text(`spoilage_label: ${prediction.spoilage_label}`, 16, cursorY)
		cursorY += 10

		report.setFont('helvetica', 'bold')
		report.setFontSize(13)
		report.text('SUGGESTIONS', 14, cursorY)
		cursorY += 7

		report.setFont('helvetica', 'normal')
		const suggestions = [
			'- Maintain door open duration below target range for each access event.',
			'- Verify compressor cycles and humidity control at regular intervals.',
			'- Schedule preventive checks when risk score trend rises week-over-week.',
		]
		suggestions.forEach((line) => {
			const wrapped = report.splitTextToSize(line, pageWidth - 30)
			report.text(wrapped, 16, cursorY)
			cursorY += wrapped.length * 5 + 1
		})

		cursorY += 4
		report.setFont('helvetica', 'bold')
		report.setFontSize(13)
		report.text('REVIEWS', 14, cursorY)
		cursorY += 7

		report.setFont('helvetica', 'normal')
		const reviewsText =
			'Operator feedback: Monitoring dashboard and predictions are improving proactive actions. Review this report with operations and QA teams during each cycle.'
		const reviewLines = report.splitTextToSize(reviewsText, pageWidth - 30)
		report.text(reviewLines, 16, cursorY)

		report.save('StorageSphere-full-report.pdf')
	}

	const handleCsvUpload = async (event) => {
		const file = event.target.files?.[0]
		setCsvUploadError('')
		setCsvResult(null)

		if (!file) {
			return
		}

		if (!file.name.toLowerCase().endsWith('.csv')) {
			setCsvUploadError('Please upload a valid CSV file.')
			return
		}

		setCsvFileName(file.name)
		setCsvUploadLoading(true)

		try {
			const rows = await parseCsvRows(file)
			const { data } = await apiClient.post('/sensor/predict/csv', { rows })
			setCsvResult(data)
		} catch (uploadError) {
			setCsvUploadError(uploadError.response?.data?.message || uploadError.message || 'CSV analysis failed.')
		} finally {
			setCsvUploadLoading(false)
		}
	}

	return (
		<div className="space-y-6 animate-fadeIn">
			<section className="neo-panel p-6">
				<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
					<div>
						<h2 className="text-2xl font-bold text-white">Unit A - Frozen Goods</h2>
						<p className="mt-1 text-sm text-slate-400">Location: Hyderabad • Capacity: 4500 L</p>
					</div>
					<div className="flex items-center gap-3">
						<StatusBadge status="warning" />
						<button type="button" className="gradient-btn">
							Export Data
						</button>
					</div>
				</div>

				<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="rounded-xl border border-tealAccent/30 bg-tealAccent/10 p-4">
						<p className="text-xs text-slate-300">Current Temperature</p>
						<p className="mt-2 text-xl font-semibold text-white">-16.8°C</p>
						<p className="mt-1 text-xs text-slate-400">Threshold: ≤ -18°C</p>
					</div>
					<div className="rounded-xl border border-success/30 bg-success/10 p-4">
						<p className="text-xs text-slate-300">Current Humidity</p>
						<p className="mt-2 text-xl font-semibold text-white">58%</p>
						<p className="mt-1 text-xs text-slate-400">Threshold: ≤ 60%</p>
					</div>
					<div className="rounded-xl border border-alert/30 bg-alert/10 p-4">
						<p className="text-xs text-slate-300">Deviation Duration</p>
						<p className="mt-2 text-xl font-semibold text-white">18 min</p>
						<p className="mt-1 text-xs text-slate-400">Action required</p>
					</div>
				</div>
			</section>

			<section className="neo-panel p-6">
				<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div>
						<h3 className="text-xl font-bold text-white">AI Spoilage Prediction</h3>
						<p className="text-sm text-slate-400">Enter current sensor and operation fields to calculate risk percentage.</p>
					</div>
					<div className="text-xs text-slate-400">Fields: temperature_C, humidity_percent, door_open_duration_min, door_frequency_per_hour, storage_hours</div>
				</div>

				<div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					<div>
						<label className="mb-1 block text-xs text-slate-300" htmlFor="temperature_C">
							temperature_C
						</label>
						<input
							id="temperature_C"
							name="temperature_C"
							type="number"
							value={formData.temperature_C}
							onChange={onFieldChange}
							className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition focus:border-tealAccent"
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs text-slate-300" htmlFor="humidity_percent">
							humidity_percent
						</label>
						<input
							id="humidity_percent"
							name="humidity_percent"
							type="number"
							value={formData.humidity_percent}
							onChange={onFieldChange}
							className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition focus:border-tealAccent"
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs text-slate-300" htmlFor="door_open_duration_min">
							door_open_duration_min
						</label>
						<input
							id="door_open_duration_min"
							name="door_open_duration_min"
							type="number"
							value={formData.door_open_duration_min}
							onChange={onFieldChange}
							className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition focus:border-tealAccent"
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs text-slate-300" htmlFor="door_frequency_per_hour">
							door_frequency_per_hour
						</label>
						<input
							id="door_frequency_per_hour"
							name="door_frequency_per_hour"
							type="number"
							value={formData.door_frequency_per_hour}
							onChange={onFieldChange}
							className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition focus:border-tealAccent"
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs text-slate-300" htmlFor="storage_hours">
							storage_hours
						</label>
						<input
							id="storage_hours"
							name="storage_hours"
							type="number"
							value={formData.storage_hours}
							onChange={onFieldChange}
							className="w-full rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition focus:border-tealAccent"
						/>
					</div>
				</div>

				<div className="mt-5 flex flex-wrap gap-3">
					<button type="button" className="gradient-btn disabled:cursor-not-allowed disabled:opacity-60" disabled={!isFormValid || isLoading} onClick={handlePredict}>
						{isLoading ? 'Predicting...' : 'Get AI Prediction'}
					</button>
					<button type="button" className="rounded-lg border border-white/25 px-4 py-2 text-sm text-white transition hover:border-tealAccent disabled:cursor-not-allowed disabled:opacity-60" disabled={!prediction} onClick={handleDownloadPdf}>
						Download as PDF
					</button>
				</div>

				{error && <p className="mt-4 text-sm text-alert">{error}</p>}

				{prediction && (
					<div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="rounded-xl border border-industrialBlue/40 bg-industrialBlue/10 p-4">
							<p className="text-xs text-slate-300">risk_score</p>
							<p className="mt-2 text-2xl font-semibold text-white">{Number(prediction.risk_score).toFixed(2)}%</p>
						</div>
						<div className="rounded-xl border border-alert/40 bg-alert/10 p-4">
							<p className="text-xs text-slate-300">spoilage_label</p>
							<p className="mt-2 text-2xl font-semibold text-white">{prediction.spoilage_label}</p>
						</div>
					</div>
				)}
			</section>

			<section className="neo-panel p-6">
				<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div>
						<h3 className="text-xl font-bold text-white">CSV Batch Analysis</h3>
						<p className="text-sm text-slate-400">Upload a CSV file and get AI risk predictions for all rows in one run.</p>
					</div>
					<div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
						Expected columns: temperature_C, humidity_percent, door_open_duration_min, door_frequency_per_hour, storage_hours
					</div>
				</div>

				<div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
					<label className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white transition hover:border-tealAccent">
						Upload CSV
						<input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
					</label>
					{csvFileName && <p className="text-sm text-slate-300">Selected: {csvFileName}</p>}
				</div>

				{csvUploadLoading && <p className="mt-3 text-sm text-tealAccent">Analyzing CSV with AI model...</p>}
				{csvUploadError && <p className="mt-3 text-sm text-alert">{csvUploadError}</p>}

				{csvResult && (
					<div className="mt-5 space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs text-slate-400">Total Rows</p>
								<p className="mt-2 text-xl font-bold text-white">{csvResult.total_rows}</p>
							</div>
							<div className="rounded-xl border border-success/30 bg-success/10 p-4">
								<p className="text-xs text-slate-300">Processed</p>
								<p className="mt-2 text-xl font-bold text-white">{csvResult.processed_rows}</p>
							</div>
							<div className="rounded-xl border border-alert/30 bg-alert/10 p-4">
								<p className="text-xs text-slate-300">Failed</p>
								<p className="mt-2 text-xl font-bold text-white">{csvResult.failed_rows}</p>
							</div>
						</div>

						<div className="overflow-x-auto rounded-xl border border-white/10">
							<table className="min-w-full text-left text-sm text-slate-200">
								<thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
									<tr>
										<th className="px-3 py-2">Row</th>
										<th className="px-3 py-2">Temp</th>
										<th className="px-3 py-2">Humidity</th>
										<th className="px-3 py-2">Risk</th>
										<th className="px-3 py-2">Label</th>
									</tr>
								</thead>
								<tbody>
									{csvResult.results.map((row) => (
										<tr key={`${row.row_number}-${row.temperature_C}`} className="border-t border-white/10">
											<td className="px-3 py-2">{row.row_number}</td>
											<td className="px-3 py-2">{row.temperature_C}</td>
											<td className="px-3 py-2">{row.humidity_percent}</td>
											<td className="px-3 py-2">{Number(row.risk_score).toFixed(2)}%</td>
											<td className="px-3 py-2">{row.spoilage_label}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</section>

			<ChartCard
				title="Weekly Temperature Pattern"
				labels={labels}
				data={[-17.8, -17.2, -16.8, -16.4, -16.9, -17.4, -16.8]}
				lineColor="#1e40af"
			/>
		</div>
	)
}

export default StorageDetails
