import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import mikeImage from "@/assets/mike.jpeg";
import oppie from "../assets/oppie.jpg";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { fetchAuthSession } from "aws-amplify/auth";

const client = generateClient<Schema>();
const Home = () => {
  // const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Schema["Blogpost"]["type"][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track auth state

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Check Authentication Status FIRST
        console.log("Checking auth session...");
        await fetchAuthSession({ forceRefresh: false }); // Check if session exists
        console.log("Auth session confirmed.");
        setIsAuthenticated(true); // Mark as authenticated

        // 2. If authenticated, THEN fetch data
        console.log("Fetching posts...");
        fetchPosts();
      } catch (authError) {
        // fetchAuthSession throws if user is not logged in
        console.log("User is not authenticated:", authError);
        setIsAuthenticated(false);
        // Don't try to fetch posts if not authenticated
        setError("You must be logged in to view posts."); // Optional message
      } finally {
        setLoading(false); // Done loading (either data or auth check)
      }
    };

    initializePage();
  }, []); // Run once on mount
  const fetchPosts = async () => {
    try {
      const session = await fetchAuthSession();

      const authMode = session.tokens ? "userPool" : "identityPool";

      const { data: items, errors } = await client.models.Blogpost.list({
        authMode,
      });
      if (errors) {
        console.error("Error fetching posts:", errors);
        setError("Failed to fetch posts. GraphQL errors occurred.");
      } else {
        console.log("Posts fetched successfully:", items);
        setPosts(items);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {posts && (
        <section className="flex w-full gap-8 items-center">
          <img src={oppie} className="w-1/2 rounded-xl h-full object-fill" />
          <div className="w-3/4 px-2 space-y-5">
            <h1 className="text-4xl">{posts[0]?.title}</h1>
            <div className="flex flex-col max-w-[800px]">
              <h2 className="text-gray-600 line-clamp-3 text-lg break-words overflow-hidden">
                {posts[0]?.content.replace(/<[^>]*>/g, "").substring(0, 350)}...
              </h2>
            </div>
            <div className="flex mt-4 gap-4 items-center">
              <img
                src={oppie}
                className="w-12 h-12 object-cover rounded-full"
                alt="author profile thumbnail"
              />
              <p className="text-gray-400">Alexander Osahon</p>
            </div>
          </div>
        </section>
      )}
      <h1 className="text-3xl font-bold text-gray-900">Latest Posts</h1>
      <div className="grid  md:grid-cols-2 gap-8 lg:grid-cols-3">
        {posts &&
          posts.map((post) => (
            <Link
              key={post?.id}
              to={`/post/${post?.id}`}
              className="  overflow-hidden  transition-shadow"
            >
              <div className="max-h-[450px]">
                <img
                  src={mikeImage}
                  className="w-full rounded-xl h-48 object-cover object-top "
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500 border px-2 py-1 rounded-xl min-w-10 flex justify-center border-gray-400 border-dashed ">
                    {post?.category}
                  </div>
                  <div className=" text-sm text-gray-400">
                    {new Date(post?.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <h2 className="text-xl uppercase font-semibold text-gray-900 my-2">
                  {post?.title}
                </h2>
                <p className="text-gray-600 line-clamp-3">
                  {post?.content
                    .replace(/<[^>]*>/g, "")
                    .substring(0, post?.title.length > 50 ? 100 : 150)}
                  ...
                </p>
                <div className="flex mt-4 gap-4 items-center">
                  <img
                    src={oppie}
                    className="w-12 h-12 object-cover rounded-full"
                    alt="author profile thumbnail"
                  />
                  <p className="text-gray-400">Alexander Osahon</p>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Home;
