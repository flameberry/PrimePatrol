import NextAuth, { DefaultSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";

// Example user database (replace with your own database calls)
const users = [
  {
    id: "1",
    username: "soham",
    // password: "$2b$10$H.s7Bz.VB0Gr5XkzUz3W9eM0v5gMVrZeyF.2FmnK.l2SNz.KqO4yu" // bcrypt hashed password
    password: "untrained0"
  },
  {
    id: "2",
    username: "atharva",
    // password: "$2b$10$H.s7Bz.VB0Gr5XkzUz3W9eM0v5gMVrZeyF.2FmnK.l2SNz.KqO4yu" // bcrypt hashed password
    password: "untrained0"
  }
];

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials ?? {};

        if (!username || !password) {
          throw new Error("Missing username or password");
        }

        // Find the user in the "database" (replace this with your actual database query)
        const user = users.find((user) => user.username === username);

        // If user doesn't exist or password doesn't match
        // if (!user || !(await compare(password, user.password))) {
        //   throw new Error("Invalid username or password");
        // }

        // Return user object (without password) if authentication is successful
        return {
          id: user.id,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      if (token.sub) {
        // Simulate fetching the user from the database using the token's subject (user ID)
        const dbUser = users.find((user) => user.id === token.sub);
        token.name = dbUser?.username;
        return token;
      }
      throw new Error("invalid token");
    },

    async session({ session, token }) {
      if (session.user && token.sub && token.name) {
        session.user.id = token.sub;
        session.user.username = token.name;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
