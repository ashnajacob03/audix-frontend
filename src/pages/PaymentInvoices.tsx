import { useEffect, useMemo, useState } from 'react';
import AudixTopbar from '@/components/AudixTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import apiService from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PaymentInvoices() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [invoices, setInvoices] = useState<any[]>([]);
	const [accountType, setAccountType] = useState<string>('');
	const [planFilter, setPlanFilter] = useState<'all' | 'monthly' | 'yearly'>('all');

	const visibleInvoices = useMemo(() => {
		const sorted = [...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		if (planFilter === 'all') return sorted;
		return sorted.filter(inv => inv.plan === planFilter);
	}, [invoices, planFilter]);

	const fetchInvoices = async () => {
		setLoading(true);
		try {
			const [invoicesResp, profileResp] = await Promise.all([
				apiService.getInvoices(),
				apiService.getProfile()
			]);
			const resp: any = invoicesResp as any;
			setInvoices(Array.isArray(resp?.data) ? resp.data : []);
			const user = (profileResp as any)?.data?.user;
			if (user?.accountType) setAccountType(user.accountType);
		} catch (e: any) {
			toast.error(e?.message || 'Failed to load invoices');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInvoices();
	}, []);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<AudixTopbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className="p-6 max-w-4xl mx-auto">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<button onClick={() => navigate('/settings-menu')} className="p-2 rounded-lg hover:bg-zinc-700/60 transition-colors text-zinc-300">
								<ChevronLeft className="w-5 h-5" />
							</button>
							<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
								<FileText className="w-5 h-5 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-white">Payment invoices</h1>
								<p className="text-zinc-400 text-sm">View and download your invoices</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<select
								value={planFilter}
								onChange={(e) => setPlanFilter(e.target.value as any)}
								className="px-2 py-2 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-md text-sm"
							>
								<option value="all">All plans</option>
								<option value="monthly">Monthly</option>
								<option value="yearly">Yearly</option>
							</select>
							<button onClick={fetchInvoices} className="px-3 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-md text-sm">
								{loading ? 'Refreshing…' : 'Refresh'}
							</button>
						</div>
					</div>

				{/* Summary */}
				<div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
						<div className="text-zinc-400 text-xs mb-1">Account</div>
						<div className="text-white font-medium capitalize">{accountType || 'unknown'}</div>
					</div>
					<div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
						<div className="text-zinc-400 text-xs mb-1">Premium since</div>
						<div className="text-white font-medium">{visibleInvoices.length > 0 ? new Date(visibleInvoices[visibleInvoices.length - 1].periodStart || visibleInvoices[visibleInvoices.length - 1].createdAt).toLocaleDateString() : '-'}</div>
					</div>
					<div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
						<div className="text-zinc-400 text-xs mb-1">Invoices</div>
						<div className="text-white font-medium">{visibleInvoices.length}</div>
					</div>
				</div>

				<div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6 max-w-4xl mx-auto">
					{visibleInvoices.length === 0 ? (
						<p className="text-zinc-400 text-sm">No invoices yet.</p>
					) : (
						<ul className="divide-y divide-zinc-700/50">
							{visibleInvoices.map((inv) => (
								<li key={inv._id} className="py-4 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-md bg-zinc-700/60 flex items-center justify-center">
											<FileText className="w-5 h-5 text-zinc-200" />
										</div>
										<div>
											<div className="text-white text-sm font-medium">
												<span className="capitalize">{inv.plan}</span> plan
												<span className="ml-2 px-2 py-0.5 rounded-md text-xs bg-zinc-700/60 text-zinc-200">{inv.status || 'paid'}</span>
											</div>
											<div className="text-xs text-zinc-400">{inv.periodStart ? `Period ${new Date(inv.periodStart).toLocaleDateString()} → ${new Date(inv.periodEnd).toLocaleDateString()}` : `Upgraded on ${new Date(inv.createdAt).toLocaleString()}`} • {inv.currency} {inv.amount}</div>
										</div>
									</div>
									<button
										onClick={async () => {
											try {
												const blob = await apiService.downloadInvoicePdf(inv._id);
												const url = URL.createObjectURL(blob);
												const a = document.createElement('a');
												a.href = url;
												a.download = `invoice-${inv._id}.pdf`;
												document.body.appendChild(a);
												a.click();
												a.remove();
												URL.revokeObjectURL(url);
											} catch (e: any) {
												toast.error(e?.message || 'Failed to download invoice');
											}
										}}
										className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
									>
										<Download className="w-4 h-4" /> Download
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
			</ScrollArea>
		</main>
	);
}






