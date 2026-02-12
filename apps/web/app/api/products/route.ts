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
