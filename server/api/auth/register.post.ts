import { query } from '~/server/utils/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, displayName } = body

    // バリデーション
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required'
      })
    }

    // パスワードのハッシュ化
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // ユーザーの作成
    const result = await query(
      'INSERT INTO login_accounts (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name, created_at',
      [email, passwordHash, displayName || null]
    )

    return {
      success: true,
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        displayName: result.rows[0].display_name,
        createdAt: result.rows[0].created_at
      }
    }
  } catch (error: any) {
    if (error.code === '23505') { // unique_violation
      throw createError({
        statusCode: 409,
        message: 'Email already exists'
      })
    }
    
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
