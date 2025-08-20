import { query } from '../../utils/db'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    // Cookieからトークンを取得
    const token = getCookie(event, 'Authorization')
    
    if (!token || !token.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'No valid token provided'
      })
    }

    const tokenValue = token.replace('Bearer ', '')
    
    // JWTトークンの検証
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET!) as any
    
    // ユーザー情報の取得
    const result = await query(
      'SELECT id, email, display_name, created_at FROM login_accounts WHERE id = $1',
      [decoded.id]
    )

    if (!result.rows.length) {
      throw createError({
        statusCode: 401,
        message: 'User not found'
      })
    }

    const user = result.rows[0]

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at
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
