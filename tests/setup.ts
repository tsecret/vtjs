import { beforeAll, vi } from "vitest";

beforeAll(async () => {
  vi.mock('@tauri-apps/plugin-http', () => ({
    fetch: async () => ({
      status: 200,
      json: async () => "No return from mock"
    })
  }));
})
