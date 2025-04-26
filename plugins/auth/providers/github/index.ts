import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { RouteTree } from "zro/plugin";
import { AuthConstructorOptions, AuthProvider } from "../../auth-provider";
import plugin, { AuthConfig } from "../../index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type GithubUser = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  notification_email: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
};

export type GithubAuthenticateUser = {
  access_token: string;
  scope: string;
  token_type: string;
  fetchUser: () => Promise<GithubUser>;
};

type GithubAppProps = {
  clientId: string;
  clientSecret: string;
  scopes?: string[];
};

export class GithubProvider extends AuthProvider<GithubAuthenticateUser> {
  public appOptions: GithubAppProps;

  constructor(
    options: GithubAppProps,
    authProps: AuthConstructorOptions<GithubAuthenticateUser>
  ) {
    super(authProps);
    this.appOptions = options;
  }

  async registerRotes(tree: RouteTree, config: AuthConfig) {
    await tree.addRootRoute(
      __dirname + "/github-action.mjs",
      config.authPrefix + "/github",
      plugin.configFileName
    );
    const loginRoute = tree.getRoute(config.loginPage);
    if (!loginRoute)
      throw new Error(
        `[Github Provider] login page "${config.loginPage}" not exists!`
      );

    await tree.addRootRoute(
      __dirname + "/github-verify.mjs",
      config.authPrefix + "/github/verify",
      plugin.configFileName
    );
  }
}
