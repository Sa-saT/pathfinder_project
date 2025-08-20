import { put } from '@vercel/blob'
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
    const { filename, contentType } = body

    if (!filename || !contentType) {
      throw createError({
        statusCode: 400,
        message: 'Filename and content type are required'
      })
    }

    // Vercel Blobの署名付きURLを生成
    const blob = await put(filename, null, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    })

    return {
      success: true,
      uploadUrl: blob.uploadUrl,
      url: blob.url
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
