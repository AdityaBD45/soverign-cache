# @sovereign/cache-handler

Redis cache handler for Next.js fetch cache with tag-based invalidation.

## Install
```bash
npm i @sovereign/cache-handler

Setup:

Create cache-handler.mjs in your Next.js project root:

import SovereignRedisCacheHandler from "@sovereign/cache-handler";
export default SovereignRedisCacheHandler;

In next.config.mjs:

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  cacheHandler: path.join(__dirname, "./cache-handler.mjs"),
};

Env
REDIS_URL="redis://localhost:6379"
SOVEREIGN_NAMESPACE="default"
SOVEREIGN_LOGS="true"
