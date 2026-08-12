import {
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  FileImage,
  FileArchive,
  FileAudio,
  FileVideo,
  Presentation,
} from 'lucide-react'

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const FILE_ICONS: Record<string, { icon: typeof FileIcon; color: string }> = {
  xlsx: { icon: FileSpreadsheet, color: 'text-green-600' },
  xls: { icon: FileSpreadsheet, color: 'text-green-600' },
  csv: { icon: FileSpreadsheet, color: 'text-green-600' },
  doc: { icon: FileText, color: 'text-blue-600' },
  docx: { icon: FileText, color: 'text-blue-600' },
  pdf: { icon: FileText, color: 'text-red-600' },
  txt: { icon: FileText, color: 'text-gray-500' },
  ppt: { icon: Presentation, color: 'text-orange-600' },
  pptx: { icon: Presentation, color: 'text-orange-600' },
  png: { icon: FileImage, color: 'text-purple-600' },
  jpg: { icon: FileImage, color: 'text-purple-600' },
  jpeg: { icon: FileImage, color: 'text-purple-600' },
  gif: { icon: FileImage, color: 'text-purple-600' },
  webp: { icon: FileImage, color: 'text-purple-600' },
  svg: { icon: FileImage, color: 'text-purple-600' },
  zip: { icon: FileArchive, color: 'text-yellow-600' },
  rar: { icon: FileArchive, color: 'text-yellow-600' },
  '7z': { icon: FileArchive, color: 'text-yellow-600' },
  mp3: { icon: FileAudio, color: 'text-pink-600' },
  wav: { icon: FileAudio, color: 'text-pink-600' },
  mp4: { icon: FileVideo, color: 'text-indigo-600' },
  mov: { icon: FileVideo, color: 'text-indigo-600' },
  avi: { icon: FileVideo, color: 'text-indigo-600' },
}

export function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return FILE_ICONS[ext] ?? { icon: FileIcon, color: 'text-gray-400' }
}

export type FileTypeMeta = {
  icon: typeof FileIcon
  badgeColor: string
  label: string
  isImage: boolean
}

const FILE_TYPE_META: Record<string, Omit<FileTypeMeta, 'isImage'>> = {
  xlsx: { icon: FileSpreadsheet, badgeColor: 'bg-green-600', label: 'Planilha do Excel' },
  xls: { icon: FileSpreadsheet, badgeColor: 'bg-green-600', label: 'Planilha do Excel' },
  csv: { icon: FileSpreadsheet, badgeColor: 'bg-green-600', label: 'Planilha CSV' },
  doc: { icon: FileText, badgeColor: 'bg-blue-600', label: 'Documento do Word' },
  docx: { icon: FileText, badgeColor: 'bg-blue-600', label: 'Documento do Word' },
  pdf: { icon: FileText, badgeColor: 'bg-red-600', label: 'PDF' },
  txt: { icon: FileText, badgeColor: 'bg-gray-500', label: 'Documento de texto' },
  ppt: { icon: Presentation, badgeColor: 'bg-orange-600', label: 'Apresentação do PowerPoint' },
  pptx: { icon: Presentation, badgeColor: 'bg-orange-600', label: 'Apresentação do PowerPoint' },
  zip: { icon: FileArchive, badgeColor: 'bg-yellow-600', label: 'Arquivo compactado' },
  rar: { icon: FileArchive, badgeColor: 'bg-yellow-600', label: 'Arquivo compactado' },
  '7z': { icon: FileArchive, badgeColor: 'bg-yellow-600', label: 'Arquivo compactado' },
  mp3: { icon: FileAudio, badgeColor: 'bg-pink-600', label: 'Áudio' },
  wav: { icon: FileAudio, badgeColor: 'bg-pink-600', label: 'Áudio' },
  mp4: { icon: FileVideo, badgeColor: 'bg-indigo-600', label: 'Vídeo' },
  mov: { icon: FileVideo, badgeColor: 'bg-indigo-600', label: 'Vídeo' },
  avi: { icon: FileVideo, badgeColor: 'bg-indigo-600', label: 'Vídeo' },
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'])

export function getFileTypeMeta(filename: string): FileTypeMeta {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (IMAGE_EXTENSIONS.has(ext)) {
    return { icon: FileImage, badgeColor: 'bg-purple-600', label: 'Imagem', isImage: true }
  }
  const meta = FILE_TYPE_META[ext]
  if (meta) return { ...meta, isImage: false }
  return { icon: FileIcon, badgeColor: 'bg-gray-400', label: 'Arquivo', isImage: false }
}
