import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FileObject } from "@supabase/storage-js";
import {
  getCurrentUser,
  fetchAuthSession,
  AuthSession,
} from "aws-amplify/auth";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import "react-quill/dist/quill.snow.css";
import { v4 as uuidv4 } from "uuid";

import Editor from "../components/Editor";
import { Authenticator } from "@aws-amplify/ui-react";

interface Category {
  id: string;
  name: string;
}

interface CognitoAuthSignInDetails {
  loginId?: string;
}

const client = generateClient<Schema>();

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [postContent, setPostContent] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [media, setMedia] = useState<FileObject | null>(null);
  const [session, setSession] = useState<AuthSession | undefined | null>(null);
  const [signInDetails, setSignInDetails] = useState<
    CognitoAuthSignInDetails | undefined
  >(undefined);

  useEffect(() => {
    checkAuthAndGetUser();
    fetchCategories();
  }, []);

  const checkAuthAndGetUser = async () => {
    try {
      // First check if user is authenticated
      const authStatus = await fetchAuthSession();
      setSession(authStatus);
      console.log(authStatus);

      if (authStatus.tokens !== undefined) {
        try {
          const { signInDetails } = await getCurrentUser();
        } catch (error) {
          console.error("Error getting current user:", error);

          setSession(null);
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking authentication:", error);

      setSession(null);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
    if (data && data.length > 0) {
      setCategoryId(data[0].id);
    }
  };
  const handleTextChange = (newText: string) => {
    setPostContent(newText); // Update the state with the new text
  };

  // const getUser = async () => {
  //   try {
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();
  //     if (user !== null) {
  //       setUserId(user.id);
  //     } else {
  //       setUserId("");
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function uploadImage(e: { file?: File; target?: any }) {
    await getUser();

    if (media) {
      const { error: deleteError } = await supabase.storage
        .from("snows-corner-bucket")
        .remove([`${userId}/${media.name}`]);

      if (deleteError) {
        console.log("Error deleting previous file:", deleteError);
      }
    }

    const file = e.target.files?.[0];

    const { data, error } = await supabase.storage
      .from("snows-corner-bucket")
      .upload(userId + "/" + uuidv4(), file);

    if (data) {
      getMedia();
    } else {
      console.log(error);
    }
  }

  async function getMedia() {
    const { data } = await supabase.storage
      .from("snows-corner-bucket")
      .list(userId + "/", {
        limit: 10,
        offset: 0,
        sortBy: {
          column: "name",
          order: "asc",
        },
      });
    console.log(media);

    if (data && data.length > 0) {
      setMedia(data[0]);
    } else {
      setMedia(null);
    }
  }

  // const handleFileUpload = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   event.preventDefault();
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const path = await uploadImage({ file });
  //     console.log(path);
  //     const imageUrl = `${
  //       supabase.storage.from("snows-corner-bucket").getPublicUrl(path).data
  //         .publicUrl
  //     }`;
  //   }
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!title || !categoryId) return;

  //   setLoading(true);
  //   try {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();
  //     if (!session) throw new Error("No session");

  //     const { error } = await supabase.from("posts").insert({
  //       title,
  //       content: postContent,
  //       category_id: categoryId,
  //       author_id: session.user.id,
  //     });

  //     if (error) throw error;
  //     navigate("/");
  //   } catch (error) {
  //     console.error("Error creating post:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // useEffect(() => {
  //   getUser();
  //   getMedia();
  // }, [media]);

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);

    try {
      const { errors } = await client.models.Blogpost.create(
        {
          title,
          content: postContent,
          author: userName,
          category: "Social",
        },
        {
          authMode: "userPool",
        }
      );
      if (errors) throw errors;
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Post</h1>
      <form onSubmit={createPost} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg  border-gray-400 shadow-md h-14 outline-none pl-4"
            required
          />
        </div>

        <div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => uploadImage(e)}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => uploadImage(e)}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-300"
            >
              Upload Image
            </button>
          </div>
          {media !== null && (
            <div className="w-52 h-52">
              <img
                src={`https://isoikalwzszsoggkzfwf.supabase.co/storage/v1/object/public/snows-corner-bucket/d3f5bbbf-635b-4d89-9a00-0294673fa074/${media.name}`}
                alt=""
                className="w-44 h-44"
              />
            </div>
          )}
        </div>

        {/* <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value="Social"
            // onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full h-12 outline-none rounded-lg px-4   border-gray-400 shadow-md"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <Editor text={postContent} onTextChange={handleTextChange} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
