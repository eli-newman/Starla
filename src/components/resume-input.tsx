'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { FileText, Upload, X, Loader2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';

interface ResumeInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  ariaDescribedBy?: string;
}

async function extractTextFromPdf(file: File): Promise<string> {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken(true);
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/parse-pdf', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to parse PDF');
  }

  return data.text;
}

export function ResumeInput({ value, onChange, id = 'resume-textarea', ariaDescribedBy }: ResumeInputProps) {
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setParseError('Only PDF files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setParseError('File too large. Max 10 MB.');
      return;
    }
    setParsing(true);
    setParseError(null);
    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        setParseError('Could not extract text from this PDF. Try pasting your resume instead.');
        return;
      }
      onChange(text.slice(0, 10000));
      setFileName(file.name);
    } catch (err) {
      console.error('PDF parse error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to parse PDF.';
      setParseError(msg);
    } finally {
      setParsing(false);
    }
  }, [onChange]);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setFileName(null);
    setParseError(null);
  }, []);

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-xs font-mono text-neutral-500 uppercase tracking-wider"
      >
        Resume / Background
      </label>

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
        aria-label="Upload resume PDF — drag and drop or click to browse"
        className={`
          flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all
          ${dragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600'
          }
        `}
      >
        {parsing ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            <span className="text-sm text-neutral-400">Extracting text from PDF...</span>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-neutral-500" />
            <span className="text-sm text-neutral-400">
              Drop a PDF here or <span className="text-white underline underline-offset-2">browse</span>
            </span>
            <span className="text-xs text-neutral-600">PDF up to 10 MB</span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={onFileSelect}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* File name indicator */}
      {fileName && (
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <FileText className="w-4 h-4 shrink-0" />
          <span className="truncate">{fileName}</span>
          <button
            type="button"
            onClick={clearFile}
            className="text-neutral-600 hover:text-white transition-colors"
            aria-label="Clear uploaded file name"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {parseError && (
        <p className="text-red-400 text-sm">{parseError}</p>
      )}

      {/* Textarea */}
      <div className="relative">
        <FileText className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600" aria-hidden="true" />
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste your resume text here..."
          aria-describedby={ariaDescribedBy}
          className="w-full h-48 bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all resize-none"
        />
      </div>
      <p className="text-xs text-neutral-600 text-right">
        {value.length.toLocaleString()} / 10,000
      </p>
    </div>
  );
}
