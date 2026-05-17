import Database from "@tauri-apps/plugin-sql";
import { CACHE_NAME } from "../utils/constants";

export interface CacheAdapter {
  get(endpoint: string): Promise<any | null>;
  set(endpoint: string, data: any, ttl: number): Promise<void>;
  delete(endpoint: string): Promise<void>;
  clear(): Promise<void>;
}

export class SQLiteCache implements CacheAdapter {
  private db?: Database;

  private async getDb(): Promise<Database> {
    if (!this.db) {
      this.db = await Database.load(CACHE_NAME);
    }
    return this.db;
  }

  async get(endpoint: string): Promise<any | null> {
    const db = await this.getDb();
    const [response] = await db.select<[{ endpoint: string; ttl: number; data: any }]>(
      "SELECT * FROM requests WHERE endpoint=$1 LIMIT 1",
      [endpoint],
    );
    if (response?.data && Date.now() < response.ttl) {
      return JSON.parse(response.data);
    }
    return null;
  }

  async set(endpoint: string, data: any, ttl: number): Promise<void> {
    const db = await this.getDb();
    await db.execute("INSERT or REPLACE into requests (endpoint, ttl, data) VALUES ($1, $2, $3)", [
      endpoint,
      Date.now() + ttl,
      JSON.stringify(data),
    ]);
  }

  async delete(endpoint: string): Promise<void> {
    const db = await this.getDb();
    await db.execute("DELETE FROM requests WHERE endpoint=$1", [endpoint]);
  }

  async clear(): Promise<void> {
    const db = await this.getDb();
    await db.execute("DELETE FROM requests", []);
  }
}
