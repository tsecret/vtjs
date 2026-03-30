export const CACHE_NAME = 'sqlite:cache.db'

const riotClientHost = import.meta.env.VITE_RIOT_CLIENT_HOST
  || import.meta.env.VITE_REMOTE_PC_IP
  || 'localhost'

export const RIOT_CLIENT_HOST = riotClientHost
  .replace(/^https?:\/\//, '')
  .replace(/\/+$/, '')
