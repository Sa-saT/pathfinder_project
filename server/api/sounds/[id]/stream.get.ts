import { query } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Sound ID is required'
      })
    }

    // 音源の情報を取得
    const result = await query(
      'SELECT * FROM sounds WHERE id = $1 AND is_public = true',
      [id]
    )

    if (!result.rows.length) {
      throw createError({
        statusCode: 404,
        message: 'Sound not found or not public'
      })
    }

    const sound = result.rows[0]

    return {
      success: true,
      sound: {
        id: sound.id,
        title: sound.title,
        description: sound.description,
        tags: sound.tags,
        durationSeconds: sound.duration_seconds,
        bitrateKbps: sound.bitrate_kbps,
        blobUrl: sound.blob_url,
        thumbnailBlobUrl: sound.thumbnail_blob_url,
        isPublic: sound.is_public,
        createdAt: sound.created_at
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
