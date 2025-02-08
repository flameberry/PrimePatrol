// src/app/SessionWrapper.tsx

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth"; 
import { redirect } from 'next/navigation';

const SessionWrapper = async ({ children }: { children: React.ReactNode }) => {
    const session = await getServerSession(authOptions); // Fetch the session
    if (!session) {
        redirect("/login"); // Redirect to sign-in if no session
    }
    return <>{children}</>; // Render children if session exists
};

export default SessionWrapper;
