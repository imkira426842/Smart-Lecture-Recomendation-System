import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { syllabusAPI, apiConfig } from '../../services/api';

export default function Step2Syllabus({ onNext, onBack }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // { success, message }
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const MAX_MB = 10;

  const selectFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`File must be smaller than ${MAX_MB}MB.`); return; }
    setFile(f);
    setError('');
    setUploadResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    selectFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      if (!apiConfig.isConfigured) {
        await new Promise(r => setTimeout(r, 1500));
        setUploadResult({ success: false, message: 'Demo Mode: Backend not configured. Syllabus cannot be processed.' });
        return;
      }
      const result = await syllabusAPI.upload(file);
      setUploadResult({ success: true, message: `Extracted ${result.topics_count || '?'} topics from ${result.subjects_count || '?'} subjects.`, data: result });
    } catch (err) {
      setUploadResult({ success: false, message: err.message || 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => { setFile(null); setUploadResult(null); setError(''); };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Upload your syllabus</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        Upload your semester or annual syllabus PDF. We'll extract your subjects and topics
        to personalize your recommendations. <strong>This step is optional.</strong>
      </p>

      {!file ? (
        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: 40,
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'var(--color-primary-lighter)' : 'var(--color-bg)',
            transition: 'all 200ms',
          }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', margin: '0 auto 16px' }}>
            <Upload size={24} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Drag & drop your syllabus PDF</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>or</div>
          <button type="button" className="btn-lp btn-secondary btn-sm">Browse Files</button>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 12 }}>PDF format · Max {MAX_MB}MB</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={e => selectFile(e.target.files[0])}
            aria-label="Select syllabus PDF"
          />
        </div>
      ) : (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20, background: 'var(--color-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: uploadResult ? 16 : 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-error-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)', flexShrink: 0 }}>
              <FileText size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{formatSize(file.size)}</div>
            </div>
            <button onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }} aria-label="Remove file">
              <X size={18} />
            </button>
          </div>

          {uploadResult && (
            <div className={`alert-lp ${uploadResult.success ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 0, marginTop: 12 }}>
              {uploadResult.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <span>{uploadResult.message}</span>
            </div>
          )}
        </div>
      )}

      {error && <div className="form-error" style={{ marginTop: 8 }}><AlertCircle size={12} />{error}</div>}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn-lp btn-secondary" onClick={onBack}>← Back</button>
        {file && !uploadResult?.success && (
          <button
            className="btn-lp btn-primary"
            onClick={handleUpload}
            disabled={uploading}
            style={{ flex: 1 }}
          >
            {uploading ? <><Loader size={15} className="spin" /> Processing...</> : 'Upload & Continue'}
          </button>
        )}
        {(uploadResult?.success || !file) && (
          <button
            className="btn-lp btn-primary"
            onClick={() => onNext(uploadResult?.success ? 'uploaded' : 'skipped')}
            style={{ flex: 1 }}
          >
            {file && uploadResult?.success ? 'Continue →' : 'Skip for Now'}
          </button>
        )}
      </div>
    </div>
  );
}
