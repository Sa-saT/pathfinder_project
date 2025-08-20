import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    // クエリパラメータを取得
    const queryParams = getQuery(event)
    const limit = parseInt(queryParams.limit as string) || 50
    const offset = parseInt(queryParams.offset as string) || 0
    const authorId = queryParams.authorId as string

    let sql = `
      SELECT 
        s.id, s.title, s.description, s.tags, 
        s.duration_seconds, s.bitrate_kbps, s.blob_url, 
        s.thumbnail_blob_url, s.is_public, s.created_at,
        u.email as author_email, u.display_name as author_display_name
      FROM sounds s
      LEFT JOIN login_accounts u ON s.author_id = u.id
      WHERE s.is_public = true
    `
    
    const params: any[] = []
    let paramIndex = 1

    if (authorId) {
      sql += ` AND s.author_id = $${paramIndex}`
      params.push(authorId)
      paramIndex++
    }

    sql += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await query(sql, params)

    const sounds = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      tags: row.tags || [],
      durationSeconds: row.duration_seconds,
      bitrateKbps: row.bitrate_kbps,
      blobUrl: row.blob_url,
      thumbnailBlobUrl: row.thumbnail_blob_url,
      isPublic: row.is_public,
      createdAt: row.created_at,
      author: {
        email: row.author_email,
        displayName: row.author_display_name
      }
    }))

    return {
      success: true,
      sounds,
      pagination: {
        limit,
        offset,
        total: sounds.length
      }
    }
  } catch (error: any) {
    console.error('List sounds error:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
