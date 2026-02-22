"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadApi } from "@/lib/api-client";
import { auth } from "@/lib/auth";
import { ensureAbsoluteImageUrl } from "@/lib/image-utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  accept = "image/*",
  maxSizeMB = 5,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes externally (fix relative/malformed URLs)
  useEffect(() => {
    if (value) {
      setPreview(ensureAbsoluteImageUrl(value) || value);
    } else {
      // Only clear preview if not currently uploading
      setPreview((prev) => (prev?.startsWith('data:') ? prev : null));
    }
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setError(null);
    setUploading(true);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const token = auth.getToken();
      if (!token) {
        throw new Error("Please log in to upload images");
      }

      const result = await uploadApi.uploadImage(file, token);
      onChange(result.url);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || "Upload failed. Please try again.";
      setError(errorMessage);
      setPreview(value || null);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative group">
          <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            {/* Use regular img tag to avoid Next.js Image optimization issues with localhost and data URLs */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={typeof preview === "string" ? ensureAbsoluteImageUrl(preview) || preview : preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image load error:', preview);
                setError('Failed to load image');
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors bg-gray-50 flex flex-col items-center justify-center"
        >
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, WEBP up to {maxSizeMB}MB
          </p>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {!preview && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Choose Image
            </>
          )}
        </Button>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {value && !preview && (
        <p className="text-xs text-gray-500">Current: {value}</p>
      )}
    </div>
  );
}

