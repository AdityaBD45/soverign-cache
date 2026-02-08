import { ensureRedisConnected, redis } from "./lib/redis";

export default async function Home() {
  await ensureRedisConnected();

  await redis.set("hello", "world");
  const val = await redis.get("hello");

  return (
    <main style={{ padding: 30 }}>
      <h1>Redis Test</h1>
      <p>{val}</p>
    </main>
  );
}
