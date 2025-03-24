import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { PenSquare, BookOpen, LogIn, LogOut, UserPlus } from "lucide-react";
import { User } from "@supabase/supabase-js";
import {
  AuthSession,
  fetchAuthSession,
  getCurrentUser,
} from "aws-amplify/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<User | null>(null);
  const [author, setAuthor] = useState<string | undefined>(undefined);
  const [session, setSession] = useState<AuthSession | undefined>(undefined);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { userId, username, signInDetails } = await getCurrentUser();
        const userSession = await fetchAuthSession();
        setAuthor(signInDetails?.loginId);
        setSession(userSession);
      } catch (error) {
        console.log(error);
      }
    };

    // const {
    //   data: { subscription },
    // } = supabase.auth.onAuthStateChange((_event, session) => {
    //   setUser(session ? session.user : null);
    // });

    // return () => subscription.unsubscribe();
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isAdmin = author === "osahonoronsaye@yahoo.com";

  return (
    <nav className="bg-[#FBFBFB] ">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              {/* <BookOpen className="h-6 w-6 text-indigo-600" /> */}
              <span className="text-xl font-bold text-gray-800">
                SNOW'S CORNER
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link
                to="/categories"
                className="text-gray-600 hover:text-gray-900"
              >
                Categories
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Link
                to="/create-post"
                className="flex items-center space-x-2  border border-black text-white px-4 py-2 rounded-xl group hover:bg-black"
              >
                <PenSquare className="h-4 w-4 text-black group-hover:text-white" />
                <span className="text-black group-hover:text-white">
                  Create Post
                </span>
              </Link>
            )}
            {session ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signup"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <hr className="w-[90%] mx-auto border-gray-300 " />
    </nav>
  );
};

export default Navbar;
