import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await dbConnect();
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }
                const user = await User.findOne({ email: credentials.email });
                if (!user || !user.password) {
                    throw new Error("User not found");
                }
                const isMatch = await bcrypt.compare(credentials.password, user.password);
                if (!isMatch) {
                    throw new Error("Incorrect password");
                }
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }: any) {
            if (account.provider === "google") {
                await dbConnect();

                // Check if user exists
                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    // Create new user
                    await User.create({
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: "user",
                        provider: "google"
                    });
                } else {
                    // Update existing user image if improved/changed
                    // This ensures profile pic is kept as requested
                    if (user.image && existingUser.image !== user.image) {
                        existingUser.image = user.image;
                        await existingUser.save();
                    }
                }
            }
            return true;
        },
        async jwt({ token, user, account }: any) {
            // Initial sign in
            if (user) {
                if (account?.provider === "google") {
                    // Fetch extended user data (role, _id) from DB
                    await dbConnect();
                    const dbUser = await User.findOne({ email: user.email });
                    if (dbUser) {
                        token.id = dbUser._id.toString();
                        token.role = dbUser.role;
                        token.picture = dbUser.image;
                    }
                } else {
                    // Credentials provider already returns mapped user
                    token.id = user.id;
                    token.role = user.role;
                }
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.image = token.picture;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
