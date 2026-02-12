import SovereignRedisCacheHandler from "@sovereign/cache-handler";

export default class AppCacheHandler extends SovereignRedisCacheHandler {
  constructor() {
    super({
      namespace: process.env.SOVEREIGN_NAMESPACE || "softsell",
    });
  }
}
