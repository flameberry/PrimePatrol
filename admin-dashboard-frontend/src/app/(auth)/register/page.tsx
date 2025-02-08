"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { app, auth } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs"; // Import bcryptjs

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const db = getFirestore(app);

  useEffect(() => {
    // Ensure Firebase is initialized only on the client-side
    if (typeof window !== "undefined") {
      // You can add any client-side only logic here
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Create user with email and password using Firebase Auth
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;

      // Hash the password with bcryptjs before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // Store user details in Firestore with email as the document ID
      await setDoc(doc(db, 'users', email), {
        email: user.email,
        password: hashedPassword, // Store the hashed password
        username: user?.email?.split("@")[0], // Example: auto-derive username from email
      });

      // Redirect to the dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Sign-up error:", error);
      setError(error.message || 'An error occurred during sign-up');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm p-6 m-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex justify-center mx-auto">
          <Image src="/login-icon.gif" alt="login-icon" width={100} height={100} />
        </div>

        <form className="mt-6" onSubmit={handleSignUp}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-800 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
            />
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="block text-sm text-gray-800 dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
            />
          </div>

          <div className="mt-4">
            <label htmlFor="confirmPassword" className="block text-sm text-gray-800 dark:text-gray-200">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-6 py-2.5 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between mt-4">
          <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/5"></span>
          <a href="#" className="text-xs text-center text-gray-500 uppercase dark:text-gray-400 hover:underline">
            or register with Social Media
          </a>
          <span className="w-1/5 border-b dark:border-gray-400 lg:w-1/5"></span>
        </div>

        <div className="flex items-center mt-6 -mx-2">
          <button
            type="button"
            onClick={() => signIn("google")}
            className="flex items-center justify-center w-full px-6 py-2 mx-2 text-sm font-medium text-white transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:bg-blue-400 focus:outline-none"
          >
            <svg className="w-4 h-4 mx-2 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"></path>
            </svg>
            <span className="hidden mx-2 sm:inline">Sign up with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
