import React, { useState } from "react";
import {
  signUp,
  confirmSignUp,
  autoSignIn,
  getCurrentUser,
} from "aws-amplify/auth"; // Import necessary functions
import { useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import { Schema } from "../../amplify/data/resource";
import { signIn } from "aws-amplify/auth";

const client = generateClient<Schema>();

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [author, setAuthor] = useState("");
  const [authorId, setAuthorId] = useState("");

  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false); // Control confirmation step UI
  const navigate = useNavigate();

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(""); // Clear previous errors
    setShowConfirmation(false);

    try {
      const { nextStep } = await signUp({
        username: email, // Using email as username based on your previous logs
        password: password,
        options: {
          userAttributes: {
            email: email,
            given_name: firstName, // <-- Pass first name state
            family_name: lastName, // Include email as a user attribute
            // Add other attributes if needed, e.g., name: 'User Name'
          },
        },
      });

      console.log("Sign up next step:", nextStep);

      if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        // User needs to confirm with a code sent to their email
        setShowConfirmation(true);
        setError("Please check your email for the confirmation code.");
      } else if (nextStep.signUpStep === "DONE") {
        // This typically happens if autoSignIn was true and successful,
        // or if confirmation isn't required by your pool settings.

        setError("Sign up successful! Redirecting...");
        navigate("/");
      }
    } catch (err: any) {
      console.error("Error signing up:", err);
      setError(err.message || "An error occurred during sign up.");
    }
  };

  const handleConfirmSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode,
      });
      if (isSignUpComplete) {
        setError("Confirmation successful! Redirecting to log-in page");

        setTimeout(async () => {
          navigate("/");
        }, 1000);
        const userData = await createUser(email, password);
        console.log("Created user data:", userData);
      }
    } catch (err: any) {
      console.error("Error confirming sign up:", err);
      setError(err.message || "An error occurred during confirmation.");
    }
  };

  const createUser = async (email: string, password: string) => {
    setAuthor(firstName + lastName);
    setAuthorId(email);

    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password: password,
    });
    const { userId } = await getCurrentUser();

    if (isSignedIn) {
      try {
        console.log("Attempting to create user record in DB...");
        const response = await client.models.User.create(
          {
            id: userId,
            firstName: firstName,
            lastName: lastName,
          },
          {
            authMode: "userPool",
          }
        );

        if (response.data) {
          console.log("Created user:", response.data);
          return response.data;
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome</h1>
        <p className="text-gray-600 mt-2">Create a new account</p>
      </div>
      {!showConfirmation ? (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="firstName"
              >
                First Name:
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full rounded-md border p-1 border-gray-300 shadow-sm focus:border-indigo-500 outline-indigo-400 focus:ring-indigo-500"
                required // Match the 'required: true' in backend
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="lastName"
              >
                Last Name:
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full rounded-md border p-1 border-gray-300 shadow-sm focus:border-indigo-500 outline-indigo-400 focus:ring-indigo-500"
                required // Match the 'required: true' in backend
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border p-1 border-gray-300 shadow-sm focus:border-indigo-500 outline-indigo-400 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border p-1 border-gray-300 shadow-sm focus:border-indigo-500 outline-indigo-400 focus:ring-indigo-500"
                required
                // Add pattern attribute for password requirements if desired
              />
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              type="submit"
            >
              Sign Up
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleConfirmSignUp} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 text-center">
              Confirm Sign Up
            </h3>
            <p className="text-gray-600 mt-2">Enter the code sent to {email}</p>
            <div>
              <label className=" text-gray-600" htmlFor="confirmationCode">
                Confirmation Code:
              </label>
              <input
                type="text"
                id="confirmationCode"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="mt-1 block w-full p-2 rounded-md border border-black  focus:border-indigo-500 outline-indigo-400 focus:ring-indigo-500 "
                required
              />
            </div>
            {error && <p style={{ color: "green" }}>{error}</p>}
            <button
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              type="submit"
            >
              {loading ? "Confirming . . . " : "Confirm sign up"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SignUpForm;
