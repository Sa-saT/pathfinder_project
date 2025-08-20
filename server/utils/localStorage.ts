import { writeFile, unlink, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const STORAGE_PATH = path.join(process.cwd(), 'storage')
const UPLOADS_PATH = path.join(STORAGE_PATH, 'uploads')
const THUMBNAILS_PATH = path.join(STORAGE_PATH, 'thumbnails')

// ディレクトリが存在しない場合は作成
const ensureDirectories = () => {
  if (!existsSync(STORAGE_PATH)) {
    require('fs').mkdirSync(STORAGE_PATH, { recursive: true })
  }
  if (!existsSync(UPLOADS_PATH)) {
    require('fs').mkdirSync(UPLOADS_PATH, { recursive: true })
  }
  if (!existsSync(THUMBNAILS_PATH)) {
    require('fs').mkdirSync(THUMBNAILS_PATH, { recursive: true })
  }
}

// ファイルを保存
export const saveFile = async (file: Buffer, filename: string, type: 'upload' | 'thumbnail' = 'upload'): Promise<string> => {
  ensureDirectories()
  
  const storagePath = type === 'upload' ? UPLOADS_PATH : THUMBNAILS_PATH
  const filePath = path.join(storagePath, filename)
  
  await writeFile(filePath, file)
  
  // 開発環境用のローカルURLを返す
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.BASE_URL || 'http://localhost:3000'
    : 'http://localhost:3000'
  
  return `${baseUrl}/storage/${type === 'upload' ? 'uploads' : 'thumbnails'}/${filename}`
}

// ファイルを削除
export const deleteFile = async (filename: string, type: 'upload' | 'thumbnail' = 'upload'): Promise<void> => {
  const storagePath = type === 'upload' ? UPLOADS_PATH : THUMBNAILS_PATH
  const filePath = path.join(storagePath, filename)
  
  if (existsSync(filePath)) {
    await unlink(filePath)
  }
}

// ファイルの存在確認
export const fileExists = (filename: string, type: 'upload' | 'thumbnail' = 'upload'): boolean => {
  const storagePath = type === 'upload' ? UPLOADS_PATH : THUMBNAILS_PATH
  const filePath = path.join(storagePath, filename)
  return existsSync(filePath)
}

// ファイルを読み込み
export const readFileContent = async (filename: string, type: 'upload' | 'thumbnail' = 'upload'): Promise<Buffer> => {
  const storagePath = type === 'upload' ? UPLOADS_PATH : THUMBNAILS_PATH
  const filePath = path.join(storagePath, filename)
  
  if (!existsSync(filePath)) {
    throw new Error('File not found')
  }
  
  return await readFile(filePath)
}

// ユニークなファイル名を生成
export const generateUniqueFilename = (originalName: string): string => {
  const ext = path.extname(originalName)
  const name = path.basename(originalName, ext)
  const uuid = randomUUID()
  return `${name}_${uuid}${ext}`
}
