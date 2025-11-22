import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';
import { formatFileSize } from '../../utils/format';

interface FileUploadProps {
  label?: string;
  error?: string;
  hint?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  value?: File[];
  onChange: (files: File[]) => void;
  preview?: boolean;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  hint,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  value = [],
  onChange,
  preview = true,
  disabled = false,
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (multiple) {
      onChange([...value, ...acceptedFiles]);
    } else {
      onChange(acceptedFiles);
    }
  }, [value, multiple, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled,
  });

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-right">
          {label}
        </label>
      )}

      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-[#D4AF37] bg-[#D4AF37] bg-opacity-5'
            : 'border-gray-300 dark:border-gray-700 hover:border-[#D4AF37]',
          error && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isDragActive ? 'أفلت الملفات هنا...' : 'اسحب الملفات هنا أو انقر للاختيار'}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          {hint || `الحد الأقصى للحجم: ${formatFileSize(maxSize)}`}
        </p>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 text-right">{error}</p>
      )}

      {preview && value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate px-2">
                      {file.name}
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 left-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate text-right">
                {formatFileSize(file.size)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
