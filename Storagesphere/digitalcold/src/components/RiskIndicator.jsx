const statusStyles = {
	safe: 'border-success/40 bg-success/10 text-success',
	warning: 'border-alert/40 bg-alert/10 text-alert',
	critical: 'border-critical/40 bg-critical/10 text-critical',
}

export function StatusBadge({ status = 'safe' }) {
	const normalized = String(status).toLowerCase()
	const style = statusStyles[normalized] || statusStyles.safe

	return (
		<span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}>
			{normalized}
		</span>
	)
}

export default StatusBadge
