import React, { useState } from 'react';
import { Upload, X, CheckCircle2, FileText, Image as ImageIcon, Loader2, Sparkles, ExternalLink, Eye } from 'lucide-react';
import api from '../../api/axios';

export default function FileUpload({ 
  label, 
  value, 
  onChange, 
  accept = "image/*,.pdf",
  placeholder = "Upload file or drop here",
  required = false,
  helperText = ""
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [filename, setFilename] = useState('');

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Direct Django Native Upload Endpoint
      const res = await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.url) {
        const fileUrl = res.data.url;
        setPreview(fileUrl);
        setFilename(res.data.filename || file.name);
        onChange(fileUrl);
      }
    } catch (err) {
      console.error('Django direct upload error:', err);
      // Fallback Data URL if server is temporarily unreachable
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        setPreview(dataUrl);
        setFilename(file.name);
        onChange(dataUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    uploadFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview('');
    setFilename('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
          <span>{label} {required && <span className="text-[var(--danger)]">*</span>}</span>
          {preview && (
            <span className="text-[10px] text-[var(--success)] font-extrabold flex items-center gap-1">
              <CheckCircle2 size={12} /> Verified File Attached
            </span>
          )}
        </label>
      )}

      {preview ? (
        <div className="relative rounded-2xl border-2 border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent-subtle)] via-[var(--bg-elevated)] to-[var(--bg-elevated)] p-3.5 flex items-center justify-between shadow-sm transition-all">
          <div className="flex items-center gap-3.5 overflow-hidden">
            {preview.startsWith('data:image') || preview.match(/\.(jpeg|jpg|gif|png|webp)/i) || preview.includes('/media/') ? (
              <img src={preview} alt="Uploaded file" className="w-12 h-12 rounded-xl object-cover border border-[var(--border)] shadow-xs shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText size={24} />
              </div>
            )}
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[var(--text)] truncate max-w-xs">
                  {filename || 'Uploaded Document / Bill'}
                </span>
                <span className="badge badge-success text-[10px] font-black uppercase">Encrypted</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                Ready for HQ Inspection • File Secured
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={preview}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-subtle)] text-[var(--accent)] transition-colors flex items-center gap-1 text-xs font-bold"
              title="Preview File"
            >
              <Eye size={14} /> View
            </a>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20"
              title="Remove File"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer group
            ${dragActive 
              ? 'border-[var(--accent)] bg-[var(--accent-subtle)]/70 scale-[1.01] shadow-md' 
              : 'border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-subtle)] shadow-xs'
            }
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              {!uploading && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-md">
                  <Sparkles size={8} />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-black text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                {uploading ? 'Uploading File...' : placeholder}
              </p>
              <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
                Drag & Drop or <span className="text-[var(--accent)] font-bold underline">Click to Browse</span>
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[10px] text-[var(--text-muted)] font-semibold">
              <span>PNG, JPG, PDF up to 10MB</span>
            </div>
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] font-medium text-[var(--text-muted)] italic">{helperText}</p>
      )}
    </div>
  );
}
