export type GithubVerifyProps = {
  clientId: string;
  clientSecret: string;
  code: string;
  redirect_uri: string;
};
export const verify = ({
  clientId,
  clientSecret,
  code,
  redirect_uri,
}: GithubVerifyProps) =>
  fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then((r) => r.json()) as Promise<
    | {
        access_token: string;
        token_type: "bearer";
        scope: string;
      }
    | { error: string; error_description: string }
  >;
