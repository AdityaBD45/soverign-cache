import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  BookOpen,
  Terminal,
  FileCode2,
  Settings,
  Server,
  Zap,
  ShieldCheck,
  Trash2,
  Tag,
  KeyRound,
  LayoutDashboard,
  Lock,
  Code,
} from "lucide-react";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-3 text-xs bg-black p-4 rounded-md overflow-x-auto border border-white/10 text-white/80">
      <code>{children}</code>
    </pre>
  );
}

export default async function DocsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-white/70" />
          Docs
        </h1>

        <p className="mt-2 text-sm text-white/60 max-w-3xl leading-relaxed">
          Sovereign Cache lets you build a centralized Redis-backed cache system
          for Next.js. It works across multiple Next.js servers and supports
          cache purging by tag/key using this dashboard.
        </p>
      </div>

      {/* Section: Install */}
      <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-6">
        <h2 className="font-medium text-white/90 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-white/60" />
          1) Install the package
        </h2>

        <CodeBlock>{`npm i @adityabd/sovereign-cache-handler redis`}</CodeBlock>
      </div>

      {/* Section: cache-handler.mjs */}
      <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-6">
        <h2 className="font-medium text-white/90 flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-white/60" />
          2) Create cache-handler.mjs in project root
        </h2>

        <p className="mt-2 text-sm text-white/55">
          Create a file called{" "}
          <span className="font-mono">cache-handler.mjs</span>{" "}
          in your Next.js project root.
        </p>

        <CodeBlock>
          {`// cache-handler.mjs
import SovereignRedisCacheHandler from "@adityabd/sovereign-cache-handler";

export default SovereignRedisCacheHandler;`}
        </CodeBlock>
      </div>

      {/* Section: next.config.mjs */}
      <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-6">
        <h2 className="font-medium text-white/90 flex items-center gap-2">
          <Settings className="h-4 w-4 text-white/60" />
          3) Update next.config.mjs
        </h2>

        <p className="mt-2 text-sm text-white/55">
          Tell Next.js to use your custom cache handler.
        </p>

        <CodeBlock>
          {`// Rename next.config.js to next.config.mjs(converts to module type)
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  cacheHandler: path.join(__dirname, "./cache-handler.mjs"),
};`}
        </CodeBlock>
      </div>

      {/* Section: env vars */}
      <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-6">
        <h2 className="font-medium text-white/90 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-white/60" />
          4) Add environment variables
        </h2>

        <p className="mt-2 text-sm text-white/55">
          Configure your Redis URL and namespace. Namespaces allow multiple apps
          to share the same Redis safely.
        </p>

        <CodeBlock>
          {`# .env.local
REDIS_URL="redis://localhost:6379"
SOVEREIGN_NAMESPACE="softsell"
SOVEREIGN_LOGS="true"`}
        </CodeBlock>

        <div className="mt-4 text-sm text-white/55 leading-relaxed">
          <div className="font-medium text-white/80 mb-1">
            🔥 Multiple apps, one Redis
          </div>
          <p>
            You can use the same Redis for multiple Next.js apps by changing{" "}
            <span className="font-mono">SOVEREIGN_NAMESPACE</span>.
          </p>

          <CodeBlock>
            {`# App 1
SOVEREIGN_NAMESPACE="softsell"

# App 2
SOVEREIGN_NAMESPACE="infra-optimizer"

# App 3
SOVEREIGN_NAMESPACE="ecommerce"`}
          </CodeBlock>
        </div>
      </div>

      {/* Section: Run Redis */}
      <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-6">
        <h2 className="font-medium text-white/90 flex items-center gap-2">
          <Server className="h-4 w-4 text-white/60" />
          5) Run Redis
        </h2>

        <p className="mt-2 text-sm text-white/55">
          In development you can run Redis locally using Docker.
        </p>

        <CodeBlock>{`docker run -p 6379:6379 redis`}</CodeBlock>

        <p className="mt-3 text-sm text-white/55">
          In production, use Upstash / Redis Cloud / self-hosted Redis and set
          the Redis URL in environment variables.
        </p>
      </div>

      {/* Section: Next.js caching */}
      <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-6">
        <h2 className="font-medium text-white/90 flex items-center gap-2">
          <Zap className="h-4 w-4 text-white/60" />
          6) Use caching in Next.js (use this code snippet to quickly check your
          redis storing cache page)
        </h2>

        <p className="mt-2 text-sm text-white/55">
          Use <span className="font-mono">unstable_cache</span> like normal. The
          response will now be stored in Redis, and tags will be tracked.
        </p>

        <CodeBlock>
          {`//create a route api/test/page.tsx
          
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
}`}
        </CodeBlock>
      </div>
{/* Final section */}
      <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-6">
        <h2 className="font-medium text-emerald-200">✅ Done 🎉</h2>

        <ul className="mt-3 space-y-2 text-sm text-white/70">
          <li>• Responses are cached in Redis</li>
          <li>• Tags are tracked</li>
          <li>• TTL works</li>
          <li>• Purge works via dashboard or API keys</li>
        </ul>

        <p className="mt-4 text-sm text-white/55">
          Next step: go to{" "}
          <span className="font-medium text-white/80">Purge</span> in the sidebar
          to purge cache instantly by tag/key.
        </p>
      </div>
      {/* ===================== NEW SECTION: PURGE DOCS ===================== */}
      <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-6 space-y-5">
        <h2 className="font-medium text-white/90 flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-white/60" />
          7) Purge Cache (2 options)
        </h2>

        <p className="text-sm text-white/60 leading-relaxed">
          Once your Next.js app is storing cache inside Redis, you can purge it
          instantly. Sovereign Cache gives you two ways to do this.
        </p>

        {/* OPTION 1 */}
        <div className="rounded-md border border-white/10 bg-black p-5">
          <div className="flex items-center gap-2 font-semibold text-white/90">
            <LayoutDashboard className="h-4 w-4 text-white/60" />
            Option 1 (Recommended): Purge using Dashboard UI
          </div>

          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            This is the easiest and safest method. You just login, create a
            namespace, and purge from the UI.
          </p>

          <div className="mt-4 space-y-2 text-sm text-white/70">
            <div>
              ✅ Go to{" "}
              <span className="font-medium text-white/80">Namespaces</span>
            </div>
            <div>
              ✅ Create a namespace with the same name as your{" "}
              <span className="font-mono">SOVEREIGN_NAMESPACE</span> in your
              Next.js app.
            </div>
            <div>
              ✅ Provide your Redis URL (Upstash / Redis Cloud / self-hosted).
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-white/50" />
              Redis URL is stored encrypted. Even admin cannot view it.
            </div>
            <div>
              ✅ Go to{" "}
              <span className="font-medium text-white/80">Purge</span> page and
              purge instantly.
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-4">
              <div className="flex items-center gap-2 font-medium text-white/85">
                <Tag className="h-4 w-4 text-white/60" />
                Purge by Tag
              </div>
              <p className="mt-2 text-sm text-white/55">
                Deletes all cache keys linked to a tag (example:{" "}
                <span className="font-mono">products</span>).
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-[#0b0b0b] p-4">
              <div className="flex items-center gap-2 font-medium text-white/85">
                <KeyRound className="h-4 w-4 text-white/60" />
                Purge by Key
              </div>
              <p className="mt-2 text-sm text-white/55">
                Deletes a single cache key (example:{" "}
                <span className="font-mono">
                  GET:/api/products?page=1
                </span>
                ).
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-white/35">
            Recommended for most users because it’s fast and avoids writing code.
          </p>
        </div>

        {/* OPTION 2 */} 
        <div className="rounded-md border border-white/10 bg-black p-5">
          <div className="flex items-center gap-2 font-semibold text-white/90">
            <Code className="h-4 w-4 text-white/60" />
            Option 2: Purge using API key (programmatic)
            
          </div>

          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            If you want to automate purge (CI/CD, cron jobs, webhooks), you can
            use your API key and call the purge endpoints directly.
          </p>

          <div className="mt-4 text-sm text-white/70">
            <div>
              ✅ Go to{" "}
              <span className="font-medium text-white/80">API Keys</span> page
              and generate a key.
            </div>
            <div>
              ⚠️ The raw key is shown only once. Copy and store it securely.
            </div>
          </div>

          <p className="mt-4 text-sm text-white/60">
            Example: Purge by tag using <span className="font-mono">curl</span>
          </p>

          <CodeBlock>
            {`curl -X POST https://YOUR_DOMAIN/api/purge-tag \\
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "namespace": "softsell",
    "tag": "products"
  }'`}
          </CodeBlock>

          <p className="mt-4 text-sm text-white/60">
            Example: Purge by key using <span className="font-mono">curl</span>
          </p>

          <CodeBlock>
            {`curl -X POST https://YOUR_DOMAIN/api/purge-key \\
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "namespace": "softsell",
    "key": "GET:/api/products?page=1"
  }'`}
          </CodeBlock>

          <p className="mt-4 text-sm text-white/60">
            Example: Node.js program (server / script)
          </p>

          <CodeBlock>
            {`// purge.js
const API_URL = "https://YOUR_DOMAIN/api/purge-tag";
const API_KEY = process.env.SOVEREIGN_API_KEY;

async function purgeTag() {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      namespace: "softsell",
      tag: "products",
    }),
  });

  const data = await res.json();
  console.log(data);
}

purgeTag();`}
          </CodeBlock>

          <p className="mt-3 text-xs text-white/35">
            For most users, the dashboard UI is the best choice.
          </p>
        </div>
      </div>

      
    </div>
  );
}
