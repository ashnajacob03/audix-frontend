import React, { useState, useEffect } from 'react';
import { X, Download, Music, Loader2, CheckCircle, AlertCircle, Play, Pause, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

interface BackgroundExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: {
    _id: string;
    title: string;
    artist: string;
    imageUrl: string;
  };
}

type ExtractionStatus = 'idle' | 'checking' | 'extracting' | 'completed' | 'error' | 'exists';

const BackgroundExtractionModal: React.FC<BackgroundExtractionModalProps> = ({
  isOpen,
  onClose,
  song
}) => {
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [isPlayingBackground, setIsPlayingBackground] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { playSong, pause, isPlaying, currentSong } = useAudioPlayer();
  const navigate = useNavigate();

  // Check extraction status when modal opens
  useEffect(() => {
    if (isOpen && song) {
      checkExtractionStatus();
    }
  }, [isOpen, song]);

  const checkExtractionStatus = async () => {
    if (!song) return;
    
    setStatus('checking');
    setError(null);
    
    try {
      const response = await api.getBackgroundStatus(song._id, { suppressAuthRedirect: true });
      const data = response?.data || response;
      
      if (data.exists) {
        setStatus('exists');
        setBackgroundUrl(data.publicUrl);
        setMessage('Background music is ready!');
      } else {
        setStatus('idle');
        setMessage('Background music not extracted yet');
      }
    } catch (err: any) {
      console.error('Error checking background status:', err);
      setStatus('error');
      if (err?.message?.includes('Authentication failed') || err?.message?.includes('401')) {
        setError('Please log in to use this feature');
      } else if (err?.message?.includes('No audio source available')) {
        setError('This song has no audio source available for background extraction. Please try with a different song.');
      } else {
        setError(err?.message || 'Failed to check extraction status');
      }
    }
  };

  const handleExtractBackground = async () => {
    if (!song) return;
    
    setStatus('extracting');
    setProgress(0);
    setError(null);
    setMessage('Starting background extraction...');
    
    try {
      // Simulate progress updates (in a real app, you'd use WebSockets)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await api.extractBackground(song._id, { suppressAuthRedirect: true });
      const data = response?.data || response;
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (data.success) {
        setStatus('completed');
        setBackgroundUrl(data.publicUrl);
        setMessage('Background music extracted successfully!');
      } else {
        throw new Error(data.message || 'Extraction failed');
      }
    } catch (err: any) {
      console.error('Error extracting background:', err);
      setStatus('error');
      if (err?.message?.includes('Authentication failed') || err?.message?.includes('401')) {
        setError('Please log in to use this feature');
      } else if (err?.message?.includes('No audio source available')) {
        setError('This song has no audio source available for background extraction. Please try with a different song.');
      } else {
        setError(err?.message || 'Failed to extract background music');
      }
      setMessage('Extraction failed');
    }
  };

  const handlePlayBackground = () => {
    if (!backgroundUrl) return;
    
    const backgroundSong = {
      _id: `${song._id}_background`,
      title: `${song.title} (Background)`,
      artist: song.artist,
      imageUrl: song.imageUrl,
      audioUrl: backgroundUrl,
      previewUrl: backgroundUrl
    };

    if (currentSong?._id === backgroundSong._id && isPlaying) {
      pause();
      setIsPlayingBackground(false);
    } else {
      playSong(backgroundSong as any);
      setIsPlayingBackground(true);
    }
  };

  const handleDownload = () => {
    if (!backgroundUrl) return;
    
    const link = document.createElement('a');
    link.href = backgroundUrl;
    link.download = `${song.title}_background.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setStatus('idle');
    setProgress(0);
    setMessage('');
    setError(null);
    setBackgroundUrl(null);
    setIsPlayingBackground(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Music className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Background Extraction</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Song Info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{song.title}</h3>
              <p className="text-zinc-400 text-sm truncate">{song.artist}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Display */}
          <div className="mb-6">
            {status === 'checking' && (
              <div className="flex items-center gap-3 text-zinc-300">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking extraction status...</span>
              </div>
            )}

            {status === 'extracting' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{message}</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-zinc-400 text-center">{Math.round(progress)}%</p>
              </div>
            )}

            {status === 'completed' && (
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>{message}</span>
              </div>
            )}

            {status === 'exists' && (
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {status === 'idle' && (
              <div className="text-zinc-300">
                <p className="mb-4">
                  Extract the background music (instrumental) from this song. 
                  This process removes vocals and creates a karaoke-style track.
                </p>
                <div className="bg-zinc-800/50 rounded-lg p-4 text-sm text-zinc-400">
                  <p className="mb-2">• Processing time: 1-3 minutes</p>
                  <p className="mb-2">• Quality: High-quality instrumental</p>
                  <p className="mb-2">• Format: MP3</p>
                  <p className="text-green-400">• Works with both full audio and preview clips</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'idle' && (
              <button
                onClick={handleExtractBackground}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Extract Background Music
              </button>
            )}

            {(status === 'completed' || status === 'exists') && backgroundUrl && (
              <div className="space-y-3">
                <button
                  onClick={handlePlayBackground}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isPlayingBackground ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause Background
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Play Background
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDownload}
                  className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Background
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                {error?.includes('Please log in') ? (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Go to Login
                  </button>
                ) : (
                  <>
                    <button
                      onClick={checkExtractionStatus}
                      className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Check Status Again
                    </button>
                    <button
                      onClick={handleExtractBackground}
                      className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>
            )}

            {status === 'extracting' && (
              <button
                disabled
                className="w-full bg-zinc-700 text-zinc-400 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
              >
                Extracting... Please wait
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundExtractionModal;
