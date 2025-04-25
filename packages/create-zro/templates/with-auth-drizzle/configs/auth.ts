import { defineConfig } from "@zro/auth";
import { PasswordProvider } from "@zro/auth/providers/password";

declare module "@zro/auth" {
  export interface User {
    id: number;
    email: string;
  }
}

export default defineConfig({
  authPrefix: "/_auth",
  generateToken: (user) => {
    return JSON.stringify(user);
  },
  onLoginSuccessRedirect: "/tasks",
  loginPage: "/auth/login",
  session: {
    password: process.env.APP_KEY!,
  },
  verifyToken(token) {
    try {
      return JSON.parse(token);
    } catch (e) {
      return null;
    }
  },
  providers: [
    new PasswordProvider({
      authenticate(data) {
        if (data.username === "me@nariman.mov" && data.password === "1234")
          return {
            id: 123,
            email: "me@nariman.mov",
          };
        throw new Error("Invalid credentials");
      },
    }),
  ],
});
