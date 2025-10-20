import React, { useState } from 'react';
import { X, Download, Eye, FileImage, FileText, File } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

// Helper function to convert relative URLs to full URLs
const getFullFileUrl = (url: string): string => {
  if (url.startsWith('http')) {
    return url;
  }
  // Extract filename from the URL path
  const filename = url.split('/').pop();
  if (filename) {
    return `${API_BASE_URL}/api/admin/artist-verifications/files/${filename}`;
  }
  return url;
};

interface ProofViewerProps {
  isOpen: boolean;
  onClose: () => void;
  verificationItem: {
    _id: string;
    displayName: string;
    user: { firstName: string; lastName: string; email: string } | string;
    socialLink?: string;
    portfolioLink?: string;
    idFileUrl?: string;
    evidenceUrls?: string[];
    createdAt: string;
  };
}

const ProofViewer: React.FC<ProofViewerProps> = ({ isOpen, onClose, verificationItem }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'unknown'>('unknown');

  const getUserName = () => {
    if (typeof verificationItem.user === 'string') {
      return verificationItem.user;
    }
    return `${verificationItem.user.firstName} ${verificationItem.user.lastName}`;
  };

  const getUserEmail = () => {
    if (typeof verificationItem.user === 'string') {
      return '';
    }
    return verificationItem.user.email || '';
  };

  const getFileType = (url: string): 'image' | 'pdf' | 'unknown' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return 'unknown';
  };

  const getFileIcon = (url: string) => {
    const type = getFileType(url);
    switch (type) {
      case 'image':
        return <FileImage className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const handleFileSelect = (url: string) => {
    setSelectedFile(url);
    setFileType(getFileType(url));
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const fullUrl = getFullFileUrl(url);
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      await Swal.fire({
        title: 'Download Failed',
        text: 'Could not download the file. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#0a0a0a',
        color: '#e5e5e5'
      });
    }
  };

  const renderFileContent = () => {
    if (!selectedFile) return null;

    switch (fileType) {
      case 'image':
        return (
          <div className="flex justify-center items-center bg-zinc-900 rounded-lg p-4 max-h-96">
            <img
              src={getFullFileUrl(selectedFile)}
              alt="Verification document"
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                console.error('Image load error:', e);
                Swal.fire({
                  title: 'Image Load Error',
                  text: 'Could not load the image. The file might be corrupted or moved.',
                  icon: 'error',
                  confirmButtonText: 'OK',
                  background: '#0a0a0a',
                  color: '#e5e5e5'
                });
              }}
            />
          </div>
        );
      case 'pdf':
        return (
          <div className="flex justify-center items-center bg-zinc-900 rounded-lg p-4 max-h-96">
            <iframe
              src={getFullFileUrl(selectedFile)}
              className="w-full h-96 rounded-lg"
              title="PDF Document"
              onError={(e) => {
                console.error('PDF load error:', e);
                Swal.fire({
                  title: 'PDF Load Error',
                  text: 'Could not load the PDF. The file might be corrupted or moved.',
                  icon: 'error',
                  confirmButtonText: 'OK',
                  background: '#0a0a0a',
                  color: '#e5e5e5'
                });
              }}
            />
          </div>
        );
      default:
        return (
          <div className="flex justify-center items-center bg-zinc-900 rounded-lg p-4 max-h-96 text-zinc-400">
            <div className="text-center">
              <File className="w-12 h-12 mx-auto mb-2" />
              <p>File preview not available</p>
              <button
                onClick={() => handleDownload(selectedFile, selectedFile.split('/').pop() || 'file')}
                className="mt-2 px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
              >
                Download to view
              </button>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  const allFiles = [
    ...(verificationItem.idFileUrl ? [{ url: verificationItem.idFileUrl, name: 'Government ID', type: 'id' }] : []),
    ...(verificationItem.evidenceUrls?.map((url, idx) => ({
      url,
      name: `Evidence ${idx + 1}`,
      type: 'evidence'
    })) || [])
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">Verification Documents</h2>
            <p className="text-zinc-400 text-sm">{getUserName()} - {verificationItem.displayName}</p>
            <p className="text-zinc-500 text-xs">{getUserEmail()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File List */}
          <div className="w-1/3 border-r border-zinc-800 p-4 overflow-y-auto">
            <h3 className="text-white font-medium mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {allFiles.length === 0 ? (
                <p className="text-zinc-400 text-sm">No files uploaded</p>
              ) : (
                allFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFile === file.url
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800'
                    }`}
                    onClick={() => handleFileSelect(file.url)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-400">
                        {getFileIcon(file.url)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{file.name}</p>
                        <p className="text-zinc-400 text-xs capitalize">
                          {getFileType(file.url)} • {file.type}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file.url, file.name);
                        }}
                        className="p-1 hover:bg-zinc-700 rounded transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-3 bg-zinc-800 rounded-lg">
              <h4 className="text-white text-sm font-medium mb-2">Additional Information</h4>
              <div className="space-y-1 text-xs text-zinc-400">
                <div>
                  <span className="text-zinc-500">Submitted:</span> {new Date(verificationItem.createdAt).toLocaleString()}
                </div>
                {verificationItem.socialLink && (
                  <div>
                    <span className="text-zinc-500">Social Link:</span>
                    <a href={verificationItem.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                      {verificationItem.socialLink}
                    </a>
                  </div>
                )}
                {verificationItem.portfolioLink && (
                  <div>
                    <span className="text-zinc-500">Portfolio:</span>
                    <a href={verificationItem.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                      {verificationItem.portfolioLink}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Preview */}
          <div className="flex-1 p-4">
            {selectedFile ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">File Preview</h3>
                  <button
                    onClick={() => handleDownload(selectedFile, selectedFile.split('/').pop() || 'file')}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                  </button>
                </div>
                {renderFileContent()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-2" />
                  <p>Select a file to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofViewer;
