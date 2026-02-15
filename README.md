# Sovereign Cache 

Sovereign Cache is a centralized Redis-backed cache system for **Next.js** multiple servers.

It allows you to:

- Store Next.js cache in Redis (multi-server ready)
- Purge cache instantly by **tag** or **key**
- Manage namespaces, API keys, and purge logs from a dashboard
- Use **BYO Redis** (Upstash / Redis Cloud / self-hosted)

---
## 🧠 Why Sovereign Cache?

Next.js cache is normally:

- local to a server instance
- hard to purge across multiple deployments

Sovereign Cache makes it:

✅ centralized  
✅ multi-instance ready  
✅ controllable using UI + API keys  

---
## ✨ What this project includes

### ✅ 1) Next.js Redis Cache Handler (NPM Package)
A custom Next.js cache handler:

📦 **@adityabd/sovereign-cache-handler**

It stores:

- fetch cache
- unstable_cache
- tag → keys mapping

inside Redis.

---

### ✅ 2) Managed Purge Dashboard (Web App)
A full dashboard built using:

- Next.js 15 App Router
- Clerk authentication (admin/user)
- MongoDB (namespace + keys + logs)
- BYO Redis per namespace (encrypted storage)

Dashboard pages:

- Namespaces
- API Keys
- Purge (tag/key)
- Logs
- Docs

---



## 🚀 Quick Start (for users)

### 1) Install the cache handler
```bash
npm i @adityabd/sovereign-cache-handler redis
```
### 2) Create `cache-handler.mjs`

```js
import SovereignRedisCacheHandler from "@adityabd/sovereign-cache-handler";

export default SovereignRedisCacheHandler;

```

### 3) Update next.config.js
```js
//rename next.config.js to next.config.mjs
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  cacheHandler: path.join(__dirname, "./cache-handler.mjs"),
};
```
---

### 4) Add env variables
```js
// for dev u can use ur local redis by running docker container
REDIS_URL="redis://localhost:6379"
SOVEREIGN_NAMESPACE="softsell"
SOVEREIGN_LOGS="true"
```
---

### 5) Run Redis locally (dev)
```bash
docker run -p 6379:6379 redis
```
---

### 🧪 Test caching quickly

Create this file:

📌 app/api/test/route.ts
```js
import { unstable_cache } from "next/cache";

const getProducts = unstable_cache(
  async () => {
    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      products: ["A", "B", "C"],
    };
  },
  ["products-list"],
  { tags: ["products"], revalidate: 120 }
);

export async function GET() {
  const data = await getProducts();
  return Response.json(data);
}
```

Now open:
```bash
http://localhost:3000/api/test
```

Refresh multiple times — generatedAt should stay the same (cached).

#### ✅ Done 🎉
• Responses are cached in Redis
• Tags are tracked
• TTL works
• Purge works via dashboard or API keys

---

Next step(if u want to purge data): go to Purge in the sidebar to purge cache instantly by tag/key.

#### 🗑️ Purging cache 
✅ Purge from Dashboard UI

This is the easiest and safest method. You just login, create a namespace, and purge from the UI.

1. ✅ Go to Namespaces
2. ✅ Create a namespace with the same name as your SOVEREIGN_NAMESPACE in your Next.js app.
3. ✅ Provide your Redis URL (Upstash / Redis Cloud / self-hosted).
Redis URL is stored encrypted. Even admin cannot view it.
4. ✅ Go to Purge page and purge instantly.
   parge by :
   Tag(Deletes all cache keys linked to a tag (example: products). ) 
   Key (Deletes a single cache key (example: GET:/api/products?page=1).)

---

#### 🧱 Tech Stack

Next.js (App Router)

Clerk Auth

MongoDB

Redis (BYO)

TailwindCSS

---