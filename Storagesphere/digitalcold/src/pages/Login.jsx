import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LandingPage() {
	const featureCards = [
		{
			title: 'Continuous Sensor Intake',
			description: 'Stream temperature and humidity data from each cold room in near real time.',
			icon: '📡',
		},
		{
			title: 'AI Risk Scoring',
			description: 'Predict spoilage risk using operational factors like door frequency and storage duration.',
			icon: '🧠',
		},
		{
			title: 'Alert-driven Operations',
			description: 'Notify teams instantly on critical deviations so action can be taken before losses occur.',
			icon: '🚨',
		},
	]

	const useCases = [
		'Food processing cold chains',
		'Dairy and frozen goods distribution',
		'Pharma and vaccine storage rooms',
		'Warehouses with SLA-driven compliance',
	]

	return (
		<div className="relative min-h-screen overflow-hidden bg-navy text-white">
			<div className="hero-orb -left-20 top-20 h-80 w-80 bg-industrialBlue/30" />
			<div className="hero-orb right-0 top-0 h-96 w-96 bg-tealAccent/20" />
			<div className="hero-orb bottom-20 right-1/3 h-72 w-72 bg-violetGlow/20" />

			<header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
				<div>
					<h1 className="bg-buttonGradient bg-clip-text text-3xl font-black text-transparent">StorageSphere</h1>
					<p className="text-xs uppercase tracking-[0.25em] text-slate-400">Digital Cold Monitoring</p>
				</div>
				<div className="flex items-center gap-3">
					<Link to="/login" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
						Login
					</Link>
					<Link to="/login?mode=register" className="gradient-btn text-sm">
						Start Free Trial
					</Link>
				</div>
			</header>

			<main className="relative z-10 mx-auto w-full max-w-7xl space-y-20 px-6 pb-24 pt-8">
				<section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
					<div className="space-y-6 animate-fadeIn">
					<div className="inline-flex rounded-full border border-tealAccent/40 bg-tealAccent/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-tealAccent">
						Enterprise-grade Monitoring for MSMEs
					</div>
					<h2 className="text-4xl font-black leading-tight md:text-6xl">
						Cold Chain Visibility <span className="shimmer-text animate-shimmer">in Real Time</span>
					</h2>
					<p className="max-w-xl text-slate-300">
						StorageSphere helps manufacturing and logistics MSMEs monitor temperature, humidity, alerts, and operational
						trends across all storage units from one modern control center.
					</p>
					<div className="flex flex-wrap gap-3">
						<Link to="/login?mode=register" className="gradient-btn">
							Create Company Account
						</Link>
						<Link to="/login" className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10">
							Go to Login
						</Link>
					</div>
					</div>

					<section className="neo-panel grid animate-fadeIn grid-cols-1 gap-4 p-6 md:grid-cols-2">
					<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<p className="text-xs text-slate-400">Monitoring Coverage</p>
						<p className="mt-2 text-3xl font-bold text-white">99.2%</p>
						<p className="mt-1 text-xs text-success">+2.4% this quarter</p>
					</div>
					<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
						<p className="text-xs text-slate-400">Active Units</p>
						<p className="mt-2 text-3xl font-bold text-white">124</p>
						<p className="mt-1 text-xs text-tealAccent">Across 12 facilities</p>
					</div>
					<div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:col-span-2">
						<p className="text-xs text-slate-400">Capabilities</p>
						<div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-200 md:grid-cols-2">
							<p>• Real-time threshold alerts</p>
							<p>• Date-range analytics & CSV export</p>
							<p>• Company-based multi-tenant access</p>
							<p>• Admin / Staff role control</p>
						</div>
					</div>
					</section>
				</section>

				<section className="space-y-5 animate-fadeIn">
					<div className="flex flex-col gap-2">
						<h3 className="text-3xl font-bold text-white">How It Works</h3>
						<p className="max-w-3xl text-sm text-slate-300">A simple three-step workflow designed for operational teams, not data scientists.</p>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{featureCards.map((item, index) => (
							<div key={item.title} className="neo-panel p-5 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
								<p className="text-2xl">{item.icon}</p>
								<p className="mt-3 text-xs text-tealAccent">Step {index + 1}</p>
								<h4 className="mt-1 text-lg font-semibold text-white">{item.title}</h4>
								<p className="mt-2 text-sm text-slate-300">{item.description}</p>
							</div>
						))}
					</div>
				</section>

				<section className="animate-fadeIn">
					<div className="neo-panel p-6 md:p-8">
						<h3 className="text-3xl font-bold text-white">What It’s For</h3>
						<p className="mt-2 text-sm text-slate-300">Reduce spoilage losses, improve compliance confidence, and scale your cold operations with fewer blind spots.</p>
						<div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
							{useCases.map((useCase) => (
								<div key={useCase} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
									• {useCase}
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="grid animate-fadeIn grid-cols-1 gap-5 lg:grid-cols-3">
					<div className="neo-panel p-6 lg:col-span-2">
						<h3 className="text-3xl font-bold text-white">Contact & Onboarding</h3>
						<p className="mt-2 text-sm text-slate-300">Need deployment support, custom thresholds, or enterprise setup? Reach us and our team will help you onboard quickly.</p>
						<div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs text-slate-400">Email</p>
								<p className="mt-1 text-white">contact@storagesphere.ai</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs text-slate-400">Support Window</p>
								<p className="mt-1 text-white">Mon-Sat, 8:00 AM - 8:00 PM</p>
							</div>
						</div>
					</div>
					<div className="neo-panel flex flex-col justify-between p-6">
						<div>
							<p className="text-xs uppercase tracking-wide text-tealAccent">Ready to start?</p>
							<h4 className="mt-2 text-2xl font-bold text-white">Deploy in Minutes</h4>
							<p className="mt-2 text-sm text-slate-300">Create your account and activate monitoring for your first storage unit today.</p>
						</div>
						<Link to="/login?mode=register" className="gradient-btn mt-5 inline-flex justify-center">
							Create Free Account
						</Link>
					</div>
				</section>
			</main>
		</div>
	)
}

function Login() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { loginWithPassword, registerCompany } = useAuth()
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login')
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		company_name: '',
		industry_type: '',
		admin_name: '',
	})

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setLoading(true)

		try {
			if (mode === 'register') {
				await registerCompany({
					company_name: formData.company_name,
					industry_type: formData.industry_type,
					admin_name: formData.admin_name,
					admin_email: formData.email,
					admin_password: formData.password,
				})
			} else {
				await loginWithPassword({
					email: formData.email,
					password: formData.password,
				})
			}

			navigate('/dashboard')
		} catch (requestError) {
			setError(requestError?.response?.data?.message || 'Authentication failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dashboardGradient px-4 py-8">
			<div className="hero-orb left-6 top-8 h-64 w-64 bg-tealAccent/20" />
			<div className="hero-orb right-6 bottom-8 h-72 w-72 bg-violetGlow/20" />
			<div className="neo-panel relative z-10 w-full max-w-lg animate-fadeIn p-8">
				<div className="mb-8 text-center space-y-2">
					<h1 className="bg-buttonGradient bg-clip-text text-3xl font-bold text-transparent">StorageSphere</h1>
					<p className="mt-2 text-sm text-slate-300">Digital Cold Monitoring System for MSMEs</p>
					<p className="text-xs text-slate-500">Enterprise security with JWT-based access control</p>
				</div>

				<div className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
					<button
						type="button"
						onClick={() => setMode('login')}
						className={`rounded-lg px-3 py-2 text-sm transition ${mode === 'login' ? 'bg-industrialBlue text-white' : 'text-slate-300 hover:bg-white/10'}`}
					>
						Login
					</button>
					<button
						type="button"
						onClick={() => setMode('register')}
						className={`rounded-lg px-3 py-2 text-sm transition ${mode === 'register' ? 'bg-industrialBlue text-white' : 'text-slate-300 hover:bg-white/10'}`}
					>
						Register Company
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					{mode === 'register' && (
						<>
							<div>
								<label htmlFor="company_name" className="mb-2 block text-sm text-slate-300">
									Company Name
								</label>
								<input
									id="company_name"
									type="text"
									required
									value={formData.company_name}
									onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
									className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-tealAccent"
									placeholder="StorageSphere Foods Pvt. Ltd."
								/>
							</div>
							<div>
								<label htmlFor="industry_type" className="mb-2 block text-sm text-slate-300">
									Industry Type
								</label>
								<input
									id="industry_type"
									type="text"
									required
									value={formData.industry_type}
									onChange={(e) => setFormData((prev) => ({ ...prev, industry_type: e.target.value }))}
									className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-tealAccent"
									placeholder="Food Processing"
								/>
							</div>
							<div>
								<label htmlFor="admin_name" className="mb-2 block text-sm text-slate-300">
									Admin Name
								</label>
								<input
									id="admin_name"
									type="text"
									required
									value={formData.admin_name}
									onChange={(e) => setFormData((prev) => ({ ...prev, admin_name: e.target.value }))}
									className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-tealAccent"
									placeholder="Operations Head"
								/>
							</div>
						</>
					)}

					<div>
						<label htmlFor="email" className="mb-2 block text-sm text-slate-300">
							Work Email
						</label>
						<input
							id="email"
							type="email"
							required
							value={formData.email}
							onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
							  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-tealAccent"
							placeholder="admin@storagesphere.com"
						/>
					</div>
					<div>
						<label htmlFor="password" className="mb-2 block text-sm text-slate-300">
							Password
						</label>
						<input
							id="password"
							type="password"
							required
							value={formData.password}
							onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
							  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-tealAccent"
							placeholder="••••••••"
						/>
					</div>

					{error && <p className="rounded-lg border border-critical/40 bg-critical/10 px-3 py-2 text-sm text-critical">{error}</p>}

					<button type="submit" disabled={loading} className="gradient-btn w-full py-3 disabled:cursor-not-allowed disabled:opacity-70">
						{loading ? 'Please wait...' : mode === 'register' ? 'Create StorageSphere Account' : 'Sign in to StorageSphere'}
					</button>

					<div className="text-center text-xs text-slate-400">
						Need platform overview?{' '}
						<Link to="/" className="text-tealAccent hover:underline">
							Visit Landing Page
						</Link>
					</div>
				</form>
			</div>
		</div>
	)
}

export default Login
