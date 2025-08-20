import { query } from '../../../utils/db'
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
    
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Sound ID is required'
      })
    }

    // 音源の情報を取得
    const result = await query(
      'SELECT * FROM sounds WHERE id = $1',
      [id]
    )

    if (!result.rows.length) {
      throw createError({
        statusCode: 404,
        message: 'Sound not found'
      })
    }

    const sound = result.rows[0]

    // ダウンロード用のBlob URLを返す
    return {
      success: true,
      downloadUrl: sound.blob_url,
      filename: `${sound.title}.mp3` // 適切な拡張子に変更する必要があります
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
    
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
