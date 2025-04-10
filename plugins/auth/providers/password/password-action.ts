import { AuthConfig } from "index";
import { PasswordProvider } from "providers/password";
import z from "zod";
import { getConfig } from "zro/plugin";
import { Action } from "zro/router";
import { getSession } from "zro/router/server";

export const actions = {
  signIn: new Action({
    input: z.object({
      username: z.string(),
      password: z.string(),
    }),
    async handler(input) {
      const config = getConfig<AuthConfig>();
      const providerConfig = config.providers[0] as PasswordProvider<{}>;
      const user = await providerConfig.authenticate(input);
      if (!user) {
        throw new Error("Invalid credentials");
      }
      const token = await config.generateToken(user);
      const session = await getSession(config.session);
      await session.update({
        token,
      });
      return user;
    },
  }),
};
