import { query } from '~/server/utils/db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // バリデーション
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required'
      })
    }

    // ユーザーの検索
    const result = await query(
      'SELECT * FROM login_accounts WHERE email = $1',
      [email]
    )

    if (!result.rows.length) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    const user = result.rows[0]

    // パスワードの検証
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // JWTトークンの生成
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Cookieにトークンを設定
    setCookie(event, 'Authorization', `Bearer ${token}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
