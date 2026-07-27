"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, X, Image, GripVertical, Star, AlertCircle } from "lucide-react";

export interface MediaItem {
  id: string;
  url: string;
  secureUrl: string;
  publicId: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  width: number | null;
  height: number | null;
  bytes: number | null;
  format: string | null;
}

export interface MediaUploadProps {
  entityType: string;
  entityId?: string;
  folder?: string;
  value?: MediaItem[];
  onChange?: (items: MediaItem[]) => void;
  onUpload?: (item: MediaItem) => void;
  onDelete?: (id: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  showPreview?: boolean;
  showOrdering?: boolean;
  showAltText?: boolean;
  showPrimary?: boolean;
  className?: string;
  disabled?: boolean;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
  preview?: string;
}

export function MediaUpload({
  entityType,
  entityId,
  folder = "system",
  value = [],
  onChange,
  onUpload,
  onDelete,
  multiple = false,
  maxFiles = 10,
  showPreview = true,
  showOrdering = true,
  showAltText = true,
  showPrimary = true,
  className = "",
  disabled = false,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      setError(null);

      if (!multiple && fileArray.length > 1) {
        setError("Only one file can be uploaded");
        return;
      }

      if (value.length + fileArray.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const newUploading: UploadingFile[] = fileArray.map((file) => ({
        id: `uploading-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        progress: 0,
        preview: URL.createObjectURL(file),
      }));

      setUploading((prev) => [...prev, ...newUploading]);

      for (const uf of newUploading) {
        try {
          const formData = new FormData();
          formData.append("file", uf.file);
          formData.append("entityType", entityType);
          if (entityId) formData.append("entityId", entityId);
          formData.append("folder", folder);
          formData.append("isPrimary", value.length === 0 ? "true" : "false");
          formData.append("sortOrder", String(value.length + newUploading.indexOf(uf)));

          const xhr = new XMLHttpRequest();

          const promise = new Promise<MediaItem>((resolve, reject) => {
            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                setUploading((prev) =>
                  prev.map((u) => (u.id === uf.id ? { ...u, progress } : u))
                );
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                  resolve(response.data);
                } else {
                  reject(new Error(response.error || "Upload failed"));
                }
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error("Network error during upload"));
            });

            xhr.open("POST", "/api/admin/media");
            xhr.send(formData);
          });

          const result = await promise;
          onUpload?.(result);
          onChange?.([...value, result]);
        } catch (err) {
          setUploading((prev) =>
            prev.map((u) =>
              u.id === uf.id
                ? { ...u, error: err instanceof Error ? err.message : "Upload failed" }
                : u
            )
          );
        } finally {
          setUploading((prev) => prev.filter((u) => u.id !== uf.id));
        }
      }
    },
    [entityType, entityId, folder, value, multiple, maxFiles, onChange, onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (disabled) return;
      if (e.dataTransfer.files?.length) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleFiles(e.target.files);
      }
      e.target.value = "";
    },
    [handleFiles]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/admin/media/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const updated = value.filter((item) => item.id !== id);
          onChange?.(updated);
          onDelete?.(id);
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },
    [value, onChange, onDelete]
  );

  const handleSetPrimary = useCallback(
    (id: string) => {
      const updated = value.map((item) => ({
        ...item,
        isPrimary: item.id === id,
      }));
      onChange?.(updated);
    },
    [value, onChange]
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updated = [...value];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const reordered = updated.map((item, index) => ({
        ...item,
        sortOrder: index,
      }));
      onChange?.(reordered);
    },
    [value, onChange]
  );

  const handleAltTextChange = useCallback(
    (id: string, altText: string) => {
      const updated = value.map((item) =>
        item.id === id ? { ...item, altText } : item
      );
      onChange?.(updated);
    },
    [value, onChange]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400 hover:bg-blue-50/50"}
          ${dragOver ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 rounded-full ${dragOver ? "bg-blue-100" : "bg-gray-100"}`}>
            <Upload className={`h-8 w-8 ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {dragOver ? "أفلت الملفات هنا" : "اسحب الملفات هنا أو انقر للرفع"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP, GIF, AVIF (حد أقصى 10MB)
              {multiple && ` • حتى ${maxFiles} ملفات`}
            </p>
          </div>
        </div>
      </div>

      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((uf) => (
            <div
              key={uf.id}
              className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              {uf.preview && (
                <img
                  src={uf.preview}
                  alt=""
                  className="h-12 w-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {uf.file.name}
                </p>
                <div className="mt-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${uf.progress}%` }}
                  />
                </div>
                {uf.error && (
                  <p className="text-xs text-red-500 mt-1">{uf.error}</p>
                )}
              </div>
              <span className="text-xs text-gray-500">{uf.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {showPreview && value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((item, index) => (
            <div
              key={item.id}
              className={`relative group rounded-xl border-2 overflow-hidden bg-white shadow-sm
                ${item.isPrimary ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
              `}
            >
              <div className="aspect-square relative">
                <img
                  src={item.secureUrl || item.url}
                  alt={item.altText || ""}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {showOrdering && index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorder(index, index - 1);
                      }}
                      className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm"
                      title="Move left"
                    >
                      <GripVertical className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  )}
                  {showPrimary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(item.id);
                      }}
                      className={`p-1.5 rounded-lg shadow-sm
                        ${item.isPrimary ? "bg-blue-500 text-white" : "bg-white/90 hover:bg-white text-gray-600"}
                      `}
                      title="Set as primary"
                    >
                      <Star className={`h-3.5 w-3.5 ${item.isPrimary ? "fill-current" : ""}`} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm"
                    title="Delete"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {item.isPrimary && (
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                      رئيسية
                    </span>
                  </div>
                )}
              </div>

              {showAltText && (
                <div className="p-2">
                  <input
                    type="text"
                    value={item.altText || ""}
                    onChange={(e) => handleAltTextChange(item.id, e.target.value)}
                    placeholder="نص بديل..."
                    className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!showPreview && value.length > 0 && (
        <div className="space-y-2">
          {value.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <img
                src={item.secureUrl || item.url}
                alt={item.altText || ""}
                className="h-10 w-10 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">
                  {item.altText || item.publicId.split("/").pop()}
                </p>
                {item.width && item.height && (
                  <p className="text-xs text-gray-500">
                    {item.width} x {item.height}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaUpload;
