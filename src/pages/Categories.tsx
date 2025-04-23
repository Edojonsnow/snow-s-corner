import React from "react";
import { Code, Book, Globe, LucideIcon, Bot, Earth } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    posts: number;
  };
}

// Add this type
type CategoryIconMap = {
  [key: string]: LucideIcon;
};

const Categories = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Update the icon mapping
  const categoryIcons: CategoryIconMap = {
    technology: Code,
    politics: Book,
    ai: Bot,
    social: Earth,
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
      <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>Test</div>;
      </div>
    </div>
  );
};

export default Categories;
