import { defineConfig } from "@zro/auth";
import { PasswordProvider } from "@zro/auth/providers/password";
import { getOrm } from "@zro/db";
import { and, eq } from "drizzle-orm";
import { users } from "~/configs/db.schema";

type User = {
  id: number;
  email: string;
};

export default defineConfig<User>({
  authPrefix: "/auth",
  loginPage: "/login",
  appKey: process.env.AUTH_SESSION_KEY!,
  verifyToken: async (token) => {
    return {
      id: 1234,
      email: "me@nariman.mov",
    };
  },
  generateToken: async (user) => {
    return "token1234";
  },
  providers: [
    new PasswordProvider<User>({
      name: "password",
      options: {},
      authenticate: async ({ username, password }) => {
        // hashed password is here
        const orm = getOrm();
        const user = await orm
          .select()
          .from(users)
          .where(and(eq(users.email, username), eq(users.password, password)))
          .get();

        if (!user) throw new Error("User not found");
        return {
          email: username,
          id: user.id,
        };
      },
    }),
  ],
});
