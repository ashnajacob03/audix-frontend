import React, { useState } from 'react';
import AudixTopbar from '@/components/AudixTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const ArtistVerification: React.FC = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = new FormData();
    form.append('displayName', displayName);
    form.append('socialLink', socialLink);
    form.append('portfolioLink', portfolioLink);
    if (idFile) form.append('idFile', idFile);
    if (evidenceFiles) {
      Array.from(evidenceFiles).forEach((f) => form.append('evidence', f));
    }

    try {
      setIsSubmitting(true);
      await api.submitArtistVerification(form);
      await Swal.fire({
        title: 'Submitted for review',
        text: 'Thanks! Our team will verify your details shortly and notify you once approved.',
        icon: 'success',
        confirmButtonText: 'Okay',
        confirmButtonColor: '#10b981',
        background: '#0a0a0a',
        color: '#e5e5e5'
      });
      navigate('/settings-menu');
    } catch (err) {
      console.error(err);
      await Swal.fire({
        title: 'Submission failed',
        text: 'Please try again in a moment.',
        icon: 'error',
        confirmButtonText: 'Close',
        background: '#0a0a0a',
        color: '#e5e5e5'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-6 max-w-2xl mx-auto text-zinc-200">
          <h1 className="text-2xl font-bold text-white mb-2">Artist Verification</h1>
          <p className="text-sm text-zinc-400 mb-6">Provide details to help us verify your artist identity.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-1">Artist/Stage Name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none" placeholder="Your artist name" required />
            </div>
            <div>
              <label className="block text-sm mb-1">Primary Social/Profile Link</label>
              <input value={socialLink} onChange={(e) => setSocialLink(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none" placeholder="Instagram, YouTube, Spotify for Artists, etc." />
            </div>
            <div>
              <label className="block text-sm mb-1">Portfolio/Website (optional)</label>
              <input value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 outline-none" placeholder="Portfolio or website" />
            </div>
            <div>
              <label className="block text-sm mb-1">Government ID (image/PDF)</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setIdFile(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            <div>
              <label className="block text-sm mb-1">Evidence of Work (audio, image, links as text file)</label>
              <input type="file" multiple onChange={(e) => setEvidenceFiles(e.target.files)} className="w-full text-sm" />
            </div>
            <div className="flex gap-3 pt-2">
              <button disabled={isSubmitting} className="px-4 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-60">{isSubmitting ? 'Submitting…' : 'Submit for review'}</button>
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-200">Cancel</button>
            </div>
          </form>
        </div>
      </ScrollArea>
    </main>
  );
};

export default ArtistVerification;


