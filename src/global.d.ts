declare global {
    let testRequestCache: { [key: string]: { value: any, ttl: number } };
}
