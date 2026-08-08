import React, { useState } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon, Loader2, Plus, Star } from 'lucide-react';
import api from '../../api/axios';

export default function MultiFileUpload({ 
  label = "Upload Equipment Photos (Multiple)", 
  values = [], 
  onChange, 
  maxFiles = 5,
  helperText = "Upload up to 5 clear photos (Front view, accessories, serial number, etc.)"
}) {
  const [uploading, setUploading] = useState(false);

  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (values.length + files.length > maxFiles) {
      alert(`You can upload a maximum of ${maxFiles} photos.`);
      return;
    }

    setUploading(true);
    const newUrls = [...values];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data && res.data.url) {
          newUrls.push(res.data.url);
        }
      } catch (err) {
        console.error('File upload error:', err);
        // Fallback Data URL
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newUrls.push(reader.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }

    setUploading(false);
    onChange(newUrls);
  };

  const handleRemove = (index) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
          {label} ({values.length}/{maxFiles})
        </label>
        {values.length > 0 && (
          <span className="text-[10px] text-[var(--success)] font-extrabold flex items-center gap-1">
            <CheckCircle2 size={12} /> {values.length} Photos Attached
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Uploaded Thumbnail Cards */}
        {values.map((url, idx) => (
          <div key={idx} className="relative group rounded-2xl overflow-hidden border-2 border-[var(--border)] bg-[var(--bg-elevated)] aspect-square shadow-xs hover:border-[var(--accent)] transition-all">
            <img src={url} alt={`Equipment Photo ${idx + 1}`} className="w-full h-full object-cover" />
            
            {/* Primary badge for 1st image */}
            {idx === 0 && (
              <span className="absolute top-1.5 left-1.5 bg-[var(--accent)] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                <Star size={9} className="fill-current" /> Cover
              </span>
            )}

            {/* Remove overlay button */}
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors shadow-md"
              title="Remove photo"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Add Photo Button / Dropzone */}
        {values.length < maxFiles && (
          <div className="relative rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-subtle)] aspect-square flex flex-col items-center justify-center text-center p-3 cursor-pointer group transition-all">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5">
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            </div>
            
            <span className="text-[11px] font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
              {uploading ? 'Uploading...' : 'Add Photos'}
            </span>
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] font-medium text-[var(--text-muted)] italic">{helperText}</p>
      )}
    </div>
  );
}
