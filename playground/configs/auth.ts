import { defineConfig, User } from "@zro/auth";
import { GithubProvider } from "@zro/auth/providers/github";
import { PasswordProvider } from "@zro/auth/providers/password";
import { getOrm } from "@zro/db";
import { and, eq, inArray } from "drizzle-orm";
import { users } from "~/configs/db.schema";

declare module "@zro/auth" {
  export interface User {
    id: number;
    email: string;
  }
}

export default defineConfig({
  authPrefix: "/auth",
  loginPage: "/login",
  session: {
    password: process.env.AUTH_SESSION_KEY!,
  },
  verifyToken: async (token) => {
    const user = JSON.parse(token) as User;
    const orm = getOrm();
    const foundUser = await orm
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .get();
    if (!foundUser) throw new Error("Invalid token");
    return foundUser;
  },
  generateToken: async (user) => {
    return JSON.stringify(user);
  },
  providers: [
    new PasswordProvider({
      async authenticate(data) {
        const orm = getOrm();
        const user = await orm
          .select()
          .from(users)
          .where(
            and(
              eq(users.email, data.username),
              eq(users.password, data.password)
            )
          )
          .get();
        if (!user) throw new Error("Invalid credentials");
        return {
          email: user.email,
          id: user.id,
        };
      },
    }),
    new GithubProvider(
      {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        scopes: ["read:user", "user:email"],
      },
      {
        async authenticate({ access_token, fetchUser }) {
          const userEmails = (await fetch(
            "https://api.github.com/user/emails",
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          ).then((r) => r.json())) as {
            email: string;
            primary: boolean;
            verified: boolean;
          }[];
          const verifiedEmails = userEmails.filter((email) => email.verified);
          if (!verifiedEmails.length) throw new Error("Permission Denied");
          const orm = getOrm();
          const user = await orm
            .select()
            .from(users)
            .where(
              inArray(
                users.email,
                verifiedEmails.map((e) => e.email)
              )
            )
            .get();
          if (!user) throw new Error("Unauthorized");
          return {
            id: user.id,
            email: user.email,
          };
        },
      }
    ),
  ],
});
