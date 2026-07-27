"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, X, Image, Loader2 } from "lucide-react";

export interface SingleImageUploadProps {
  value?: string;
  onChange?: (url: string | null) => void;
  onMediaId?: (mediaId: string) => void;
  entityType: string;
  entityId?: string;
  folder?: string;
  altText?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function SingleImageUpload({
  value,
  onChange,
  onMediaId,
  entityType,
  entityId,
  folder = "system",
  altText,
  className = "",
  disabled = false,
  placeholder = "اسحب صورة هنا أو انقر للرفع",
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("entityType", entityType);
        if (entityId) formData.append("entityId", entityId);
        formData.append("folder", folder);
        formData.append("altText", altText || file.name);
        formData.append("isPrimary", "true");

        const response = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        if (data.success) {
          onChange?.(data.data.secureUrl || data.data.url);
          onMediaId?.(data.data.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [entityType, entityId, folder, altText, onChange, onMediaId]
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        uploadFile(e.target.files[0]);
      }
      e.target.value = "";
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (disabled || uploading) return;
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [disabled, uploading, uploadFile]
  );

  const handleDelete = useCallback(() => {
    onChange?.(null);
    onMediaId?.("");
    setError(null);
  }, [onChange, onMediaId]);

  return (
    <div className={`relative ${className}`}>
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
          {error}
        </div>
      )}

      {value ? (
        <div className="relative group rounded-xl border-2 border-gray-200 overflow-hidden">
          <img
            src={value}
            alt={altText || ""}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="p-2 bg-white/90 rounded-lg hover:bg-white shadow-sm"
              title="Replace"
            >
              <Upload className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={handleDelete}
              disabled={disabled || uploading}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm"
              title="Delete"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-all duration-200
            ${disabled || uploading ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400 hover:bg-blue-50/50"}
            ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={disabled || uploading}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">جاري الرفع...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-full">
                <Image className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <p className="text-sm text-gray-600">{placeholder}</p>
              <p className="text-xs text-gray-400">PNG, JPG, WebP (حد أقصى 10MB)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SingleImageUpload;
