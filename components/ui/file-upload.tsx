"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "./button"
import { Progress } from "./progress"

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  acceptedTypes?: string[]
  maxSize?: number
  multiple?: boolean
  className?: string
}

interface UploadedFile {
  file: File
  status: "uploading" | "success" | "error"
  progress: number
  error?: string
}

export function FileUpload({
  onUpload,
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx"],
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  className = "",
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        status: "uploading" as const,
        progress: 0,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])

      try {
        // Simuler l'upload avec progression
        for (let i = 0; i < newFiles.length; i++) {
          const fileIndex = uploadedFiles.length + i

          // Simuler la progression
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            setUploadedFiles((prev) => prev.map((f, idx) => (idx === fileIndex ? { ...f, progress } : f)))
          }

          // Marquer comme terminé
          setUploadedFiles((prev) =>
            prev.map((f, idx) => (idx === fileIndex ? { ...f, status: "success", progress: 100 } : f)),
          )
        }

        await onUpload(acceptedFiles)
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            newFiles.some((nf) => nf.file === f.file) ? { ...f, status: "error", error: "Erreur lors de l'upload" } : f,
          ),
        )
      }
    },
    [onUpload, uploadedFiles.length],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple,
  })

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        {isDragActive ? (
          <p className="text-blue-600">Déposez les fichiers ici...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-1">Glissez-déposez vos fichiers ici, ou cliquez pour sélectionner</p>
            <p className="text-sm text-gray-400">
              {acceptedTypes.join(", ")} - Max {formatFileSize(maxSize)}
            </p>
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Fichiers uploadés</h4>
          {uploadedFiles.map((uploadedFile, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <File className="h-5 w-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.file.size)}</p>
                {uploadedFile.status === "uploading" && <Progress value={uploadedFile.progress} className="mt-1" />}
              </div>
              <div className="flex items-center space-x-2">
                {uploadedFile.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {uploadedFile.status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
