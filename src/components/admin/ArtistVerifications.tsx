import { useEffect, useState } from 'react';
import adminApi from '@/services/adminApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import Swal from 'sweetalert2';
import { BarChart3 } from 'lucide-react';

type VerificationItem = {
  _id: string;
  user: { firstName: string; lastName: string; email: string } | string;
  displayName: string;
  socialLink?: string;
  portfolioLink?: string;
  idFileUrl?: string;
  evidenceUrls?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

const ArtistVerifications = () => {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await adminApi.getArtistVerifications();
      setItems(resp.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const confirmAnd = async (title: string, action: () => Promise<any>) => {
    const r = await Swal.fire({
      title,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      background: '#0a0a0a',
      color: '#e5e5e5'
    });
    if (!r.isConfirmed) return;
    await action();
    await load();
  };

  const approve = (id: string) => confirmAnd('Approve this artist?', async () => {
    await adminApi.approveArtistVerification(id);
    await Swal.fire({ title: 'Approved', icon: 'success', confirmButtonColor: '#10b981', background: '#0a0a0a', color: '#e5e5e5' });
  });

  const reject = async (id: string) => {
    const { value: notes } = await Swal.fire({
      title: 'Reject this artist?',
      input: 'text',
      inputLabel: 'Reason (optional)',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#ef4444',
      background: '#0a0a0a',
      color: '#e5e5e5'
    });
    if (notes !== undefined) {
      await adminApi.rejectArtistVerification(id, notes as string);
      await Swal.fire({ title: 'Rejected', icon: 'success', background: '#0a0a0a', color: '#e5e5e5' });
      await load();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Artist Verifications</h2>
        <button
          onClick={() => {
            const headers = ['ID','Display Name','User','Email','Status','Submitted At'];
            const rows = items.map(it => [
              it._id,
              it.displayName,
              typeof it.user === 'string' ? it.user : `${it.user.firstName} ${it.user.lastName}`,
              typeof it.user === 'string' ? '' : (it.user.email || ''),
              it.status,
              new Date(it.createdAt).toISOString()
            ]);
            const csv = [headers.join(','), ...rows.map(r => r.map(f => `"${(f ?? '').toString().replace(/"/g,'""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'artist-verifications-report.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-200"
        >
          <BarChart3 className="w-4 h-4" />
          Generate Report
        </button>
      </div>
      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-zinc-400">No pending requests.</div>
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it._id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{it.displayName}</div>
                    <div className="text-zinc-400 text-sm">{typeof it.user === 'string' ? it.user : `${it.user.firstName} ${it.user.lastName}`} — {typeof it.user === 'string' ? '' : it.user.email}</div>
                    <div className="text-zinc-500 text-xs mt-1">{new Date(it.createdAt).toLocaleString()}</div>
                    <div className="text-zinc-400 text-xs mt-2 break-all">
                      {it.socialLink && (<div>Social: {it.socialLink}</div>)}
                      {it.portfolioLink && (<div>Portfolio: {it.portfolioLink}</div>)}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {it.idFileUrl && (<a className="text-sky-400 text-sm" href={it.idFileUrl} target="_blank">ID File</a>)}
                      {it.evidenceUrls?.map((url, idx) => (
                        <a key={idx} className="text-sky-400 text-sm" href={url} target="_blank">Evidence {idx + 1}</a>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approve(it._id)} className="px-3 py-2 rounded-md bg-emerald-600 text-white">Approve</button>
                    <button onClick={() => reject(it._id)} className="px-3 py-2 rounded-md border border-red-600 text-red-400">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ArtistVerifications;


