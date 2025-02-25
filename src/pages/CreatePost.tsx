import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import "react-quill/dist/quill.snow.css";

import Editor from "../components/Editor";

interface Category {
  id: string;
  name: string;
}

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [postContent, setPostContent] = React.useState("");

  React.useEffect(() => {
    fetchCategories();
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session || session.user.email !== "osahonoronsaye@yahoo.com") {
      navigate("/");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId) return;

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { error } = await supabase.from("posts").insert({
        title,
        content: postContent,
        category_id: categoryId,
        author_id: session.user.id,
      });

      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Create New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

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
