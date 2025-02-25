import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  categories: {
    name: string;
    slug: string;
  };
}

const Home = () => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          categories (
            name,
            slug
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
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
      <h1 className="text-4xl font-bold text-gray-900">Latest Posts</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          // <Link
          //   key={post.id}
          //   to={`/post/${post.id}`}
          //   className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          // >
          //   <div className="p-6">
          //     <div className="text-sm text-indigo-600 mb-2">{post.categories.name}</div>
          //     <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
          //     <p className="text-gray-600 line-clamp-3">
          //       {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
          //     </p>
          //     <div className="mt-4 text-sm text-gray-500">
          //       {new Date(post.created_at).toLocaleDateString()}
          //     </div>
          //   </div>
          // </Link>
          <Link key={post.id} to={`/post/${post.id}`}>
            <Card className="w-[350px] hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-fit">
                  <span className="text-xs font-medium bg-primary/10 text-primary rounded-full px-3 py-1">
                    {post.categories.name}
                  </span>
                </div>
                <CardTitle className="mt-3 line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {post.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                </p>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
