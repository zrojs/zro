type User = {
  name: string;
  email: string;
  role: string;
};

const auth = {
  callbackPrefix: "_auth",
  loginPath: "/login",
  verifyToken: (token: string): User => {
    return {
      name: "nariman",
      email: "me@nariman.work",
      role: "admin",
    };
  },
  generateToken: (user: User) => {
    return "token12341234";
  },
  providers: [
    {
      name: "password",
      /*
        registers a post handler on _auth/password
        to authenticate username and password
      */
      authenticate: (username: string, password: string): User => {
        return {
          name: "nariman",
          email: "me@nariman.work",
          role: "admin",
        };
      },
    },
    {
      name: "google",
      /*
        registers a get handler on _auth/google to redirect to google auth page
        registers another get handler to fetch user info callback on _auth/google/callback
        to authenticate username and password
      */
      options: {
        clientId: import.meta.env.GOOGLE_CLIENT_ID,
        clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
        redirectUri: "/_auth/google/callback",
      },
      authenticate: (code: string): User => {
        return {
          name: "nariman",
          email: "me@nariman.work",
          role: "admin",
        };
      },
    },
  ],
};
