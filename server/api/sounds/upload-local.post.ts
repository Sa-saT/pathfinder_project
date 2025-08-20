import { saveFile, generateUniqueFilename } from '../../utils/localStorage'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    // Cookieからトークンを取得
    const token = getCookie(event, 'Authorization')
    
    if (!token || !token.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required'
      })
    }

    const tokenValue = token.replace('Bearer ', '')
    
    // JWTトークンの検証
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET!) as any
    
    // マルチパートフォームデータを処理
    const formData = await readMultipartFormData(event)
    
    if (!formData) {
      throw createError({
        statusCode: 400,
        message: 'No form data provided'
      })
    }

    let audioFile: any = null
    let title = ''
    let description = ''
    let tags = ''
    let isPublic = 'true'

    // フォームデータから各フィールドを抽出
    for (const field of formData) {
      if (field.name === 'audioFile' && field.filename) {
        audioFile = field
      } else if (field.name === 'title') {
        title = field.data.toString()
      } else if (field.name === 'description') {
        description = field.data.toString()
      } else if (field.name === 'tags') {
        tags = field.data.toString()
      } else if (field.name === 'isPublic') {
        isPublic = field.data.toString()
      }
    }

    if (!audioFile || !title) {
      throw createError({
        statusCode: 400,
        message: 'Audio file and title are required'
      })
    }

    // ファイル名を生成
    const filename = generateUniqueFilename(audioFile.filename)
    
    // ファイルをローカルストレージに保存
    const fileUrl = await saveFile(audioFile.data, filename, 'upload')
    
    // 音源のメタデータをデータベースに保存
    const { query } = await import('../../utils/db')
    
    const result = await query(
      `INSERT INTO sounds (
        title, description, tags, blob_url, is_public, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, title, created_at`,
      [
        title,
        description || null,
        tags ? tags.split(',').map(tag => tag.trim()) : [],
        fileUrl,
        isPublic === 'true',
        decoded.id
      ]
    )

    return {
      success: true,
      sound: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        createdAt: result.rows[0].created_at,
        blobUrl: fileUrl
      }
    }
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        message: 'Invalid or expired token'
      })
    }
    
    if (error.statusCode) {
      throw error
    }
    
    console.error('Upload error:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
