import React from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "aws-amplify/auth";
import outputs from "../../amplify_outputs.json";
import { LogIn } from "lucide-react";
import { Amplify } from "aws-amplify";

Amplify.configure(outputs);

interface SignInFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface SignInForm extends HTMLFormElement {
  readonly elements: SignInFormElements;
}

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSignIn = async (e: FormEvent<SignInForm>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn({
        username: email,
        password: password,
      });
      navigate("/");
      window.location.reload(); // This will refresh the page after navigation
    } catch (error) {
      setError("Invalid email or password");
      console.error("Error signing in:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <LogIn className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600 mt-2">
          Sign in to your account to continue
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSignIn} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
