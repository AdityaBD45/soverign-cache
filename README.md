# Sovereign Cache 🚀

Sovereign Cache is a centralized Redis-backed cache system for **Next.js**.

It allows you to:

- Store Next.js cache in Redis (multi-server ready)
- Purge cache instantly by **tag** or **key**
- Manage namespaces, API keys, and purge logs from a dashboard
- Use **BYO Redis** (Upstash / Redis Cloud / self-hosted)

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

## 🧠 Why Sovereign Cache?

Next.js cache is normally:

- local to a server instance
- hard to purge across multiple deployments

Sovereign Cache makes it:

✅ centralized  
✅ multi-instance ready  
✅ controllable using UI + API keys  

---

## 🚀 Quick Start (for users)

### 1) Install the cache handler
```bash
npm i @adityabd/sovereign-cache-handler redis
