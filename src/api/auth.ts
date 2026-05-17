export type RefreshAuthTokens = { accessToken: string; entToken: string };
export type RefreshAuthCallback = () => Promise<RefreshAuthTokens>;

export class Auth {
  private headers: Record<string, string>;
  private refreshPromise: Promise<void> | null = null;
  private callback?: RefreshAuthCallback;

  constructor(initialHeaders: Record<string, string>) {
    this.headers = initialHeaders;
  }

  getHeaders(): Readonly<Record<string, string>> {
    return this.headers;
  }

  setCallback(callback: RefreshAuthCallback) {
    this.callback = callback;
  }

  private updateAuthHeaders(tokens: RefreshAuthTokens) {
    this.headers = {
      ...this.headers,
      "X-Riot-Entitlements-JWT": tokens.entToken,
      Authorization: `Bearer ${tokens.accessToken}`,
    };
  }

  async refreshIfNeeded(): Promise<boolean> {
    if (!this.callback) return false;

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const tokens = await this.callback!();
        this.updateAuthHeaders(tokens);
      })().finally(() => {
        this.refreshPromise = null;
      });
    }

    try {
      await this.refreshPromise;
      return true;
    } catch {
      return false;
    }
  }
}
