import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import {
  AuthSession,
  fetchAuthSession,
  getCurrentUser,
} from "aws-amplify/auth";

const client = generateClient<Schema>();
const Post = () => {
  const { id } = useParams();
  const [comments, setComments] = useState<Schema["Comments"]["type"][]>([]);
  const [post, setPost] = useState<Schema["Blogpost"]["type"]>();
  const [newComment, setNewComment] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [userSession, setUserSession] = useState<AuthSession | undefined>(
    undefined
  );
  const [user, setUser] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchPost();

    checkUser();
  }, [id]);

  const checkUser = async () => {
    const session = await fetchAuthSession();
    const { userId, username, signInDetails } = await getCurrentUser();
    setUser(username);
    setUserSession(session);
  };

  const fetchPost = async () => {
    try {
      if (!id) return;
      const { data: blogpost } = await client.models.Blogpost.get(
        { id },
        {
          authMode: "identityPool",
        }
      );
      if (blogpost) {
        setPost(blogpost as Schema["Blogpost"]["type"]);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data: comments } = await client.models.Comments.list({
        filter: {
          blogpost_id: {
            eq: id,
          },
        },
      });
      setComments(comments);
    } catch (error) {
      console.log(error);
    }
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const { errors } = await client.models.Comments.create({
      comment: newComment,
      user: user,
      blogpost_id: id,
    });

    if (errors) throw errors;
    setNewComment("");
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
      {
        <article className="prose max-w-none">
          <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8">
            <span>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span>•</span>
            <span>{post.category}</span>
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content),
            }}
          />
        </article>
      }

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Comments</h2>

        {userSession ? (
          <form onSubmit={postComment} className="mb-8">
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

        {/* <div className="space-y-6">
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
        </div> */}
      </div>
    </div>
  );
};

export default Post;
