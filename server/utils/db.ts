import pg from 'pg'

const config = useRuntimeConfig()

const pool = new pg.Pool({ 
  connectionString: config.databaseUrl,
  ssl: config.public.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
})

export const query = (text: string, params?: any[]) => pool.query(text, params)

export const closePool = () => pool.end()
