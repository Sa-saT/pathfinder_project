import { query } from '../../utils/db'
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
    
    const body = await readBody(event)
    const { 
      title, 
      description, 
      tags, 
      durationSeconds, 
      bitrateKbps, 
      blobUrl, 
      thumbnailBlobUrl, 
      isPublic 
    } = body

    if (!title || !blobUrl) {
      throw createError({
        statusCode: 400,
        message: 'Title and blob URL are required'
      })
    }

    // 音源のメタデータをデータベースに保存
    const result = await query(
      `INSERT INTO sounds (
        title, description, tags, duration_seconds, bitrate_kbps, 
        blob_url, thumbnail_blob_url, is_public, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id, title, created_at`,
      [
        title,
        description || null,
        tags || [],
        durationSeconds || null,
        bitrateKbps || null,
        blobUrl,
        thumbnailBlobUrl || null,
        isPublic !== undefined ? isPublic : true,
        decoded.id
      ]
    )

    return {
      success: true,
      sound: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        createdAt: result.rows[0].created_at
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
    
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
