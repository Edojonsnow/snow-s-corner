import React from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import DOMPurify from "dompurify";
import { User } from "@supabase/supabase-js";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    email: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  categories: {
    name: string;
  };
}

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = React.useState<Post | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    fetchPost();
    fetchComments();
    checkUser();
  }, [id]);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          categories (
            name
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        profiles (
          email
        )
      `
      )
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase.from("comments").insert({
        content: newComment.trim(),
        post_id: id,
        user_id: user.id,
      });

      if (error) throw error;
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8">
          <span>
            {new Date(post.created_at).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span>•</span>
          <span>{post.categories.name}</span>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      </article>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Comments</h2>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              placeholder="Add a comment..."
              required
            />
            <div className="mt-4">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600 mb-8">
            Please sign in to leave a comment.
          </p>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-900">
                  {comment.profiles.email}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Post;
