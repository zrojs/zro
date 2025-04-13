import { AuthConfig } from "index";
import z from "zod";
import { getConfig } from "zro/plugin";
import { Action, redirect } from "zro/router";
import { getSession } from "zro/router/server";
import { PasswordProvider } from "./index";

export const actions = {
  signIn: new Action({
    input: z.object({
      username: z.string(),
      password: z.string(),
    }),
    async handler(input) {
      const config = getConfig<AuthConfig>();
      const providerConfig = config.providers.find(
        (provider) => provider instanceof PasswordProvider
      );
      if (!providerConfig)
        throw new Error("Unable to find the password provider");
      const user = await providerConfig.authenticate(input);
      const session = await getSession(config.session);
      if (!user) {
        session.clear();
        throw new Error("Invalid credentials");
      }
      const token = await config.generateToken(user);
      await session.update({
        token,
      });
      if (config.onLoginSuccessRedirect)
        return redirect(config.onLoginSuccessRedirect);
      return user;
    },
  }),
};
