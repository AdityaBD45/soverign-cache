import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getAuthUserOrThrow() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const role = (user.publicMetadata?.role as string | undefined) || "user";

  return { userId, role, user };
}
