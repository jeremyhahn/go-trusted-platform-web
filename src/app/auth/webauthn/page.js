"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { getBaseUrl } from "../../../utils/getBaseUrl";
import { getCookie, setCookie } from "../../../utils/cookie";
import styles from "./WebAuthnUI.module.css";

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

const setUserIdHeader = (userId) => {
  if (userId) {
    axiosInstance.defaults.headers.common["X-User-Id"] = userId;
  } else {
    delete axiosInstance.defaults.headers.common["X-User-Id"];
  }
};

// Separate component to handle authentication status
function AuthStatus({ setStatus }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuthStatus = () => {
      const jwt = getCookie("jwt");
      if (jwt) {
        setAuthToken(jwt);
        router.push("/protected");
      } else {
        const statusParam = searchParams.get("status");
        if (statusParam) {
          setStatus(statusParam);
        }
      }
    };

    checkAuthStatus();
  }, [router, searchParams, setStatus]);

  return null; // This component doesn't render anything
}

export default function WebAuthnUI() {
  const [status, setStatus] = useState("registered"); // Default status
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    if (!username) {
      setErrorMessage("Please enter a username.");
      return;
    }

    setLoading(true);
    setStatus("registering");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axiosInstance.post(
        "/api/v1/webauthn/registration/begin",
        { username }
      );

      const { publicKey } = response.data;
      if (!publicKey) {
        throw new Error("Invalid registration options returned from the server.");
      }

      const userId = publicKey.user?.id;
      if (!userId) {
        throw new Error("User ID not found in the registration options.");
      }

      setUserIdHeader(userId);

      const attestationResponse = await startRegistration(publicKey);

      const verificationResponse = await axiosInstance.post(
        "/api/v1/webauthn/registration/finish",
        attestationResponse,
        { headers: { "X-User-Id": userId } }
      );

      setUserIdHeader(null);

      if (verificationResponse.status === 200 && verificationResponse.data.payload) {
        const jwt = verificationResponse.data.payload.token;
        setAuthToken(jwt);
        setCookie("jwt", jwt, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          secure: true,
          sameSite: "Strict",
        });
        setStatus("registered");
        setSuccessMessage("Registration successful!");
        router.push("/protected");
      } else {
        setStatus("not_registered");
        setErrorMessage("Registration failed. Please try again.");
      }
    } catch (error) {
      handleRequestError(error, "Registration");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username) {
      setErrorMessage("Please enter your username.");
      return;
    }

    setLoading(true);
    setStatus("authenticating");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axiosInstance.post("/api/v1/webauthn/login/begin", {
        username,
      });

      const { publicKey } = response.data;
      if (!publicKey) {
        throw new Error("Invalid authentication options returned from the server.");
      }

      const userId = response.headers["x-user-id"];
      if (!userId) {
        throw new Error("User ID not found in the response headers.");
      }

      setCookie("uid", userId, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: true,
        sameSite: "Strict",
      });

      setUserIdHeader(userId);

      const assertionResponse = await startAuthentication(publicKey);

      const verificationResponse = await axiosInstance.post(
        "/api/v1/webauthn/login/finish",
        assertionResponse,
        { headers: { "X-User-Id": userId } }
      );

      setUserIdHeader(null);

      if (verificationResponse.data.success && verificationResponse.data.payload) {
        const jwt = verificationResponse.data.payload.token;
        setAuthToken(jwt);
        setCookie("jwt", jwt, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          secure: true,
          sameSite: "Strict",
        });
        setSuccessMessage("Login successful!");
        router.push("/protected");
      } else {
        setErrorMessage("Login failed. Please try again.");
        setStatus("registered");
      }
    } catch (error) {
      handleRequestError(error, "Login");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestError = (error, action) => {
    console.error(`${action} Error:`, error);
    if (
      error.code === "ECONNREFUSED" ||
      error.message.includes("Network Error")
    ) {
      setErrorMessage("The server is currently unavailable. Please try again later.");
    } else if (error === "user already exists") {
      setErrorMessage(error);
    } else if (error.response) {
      if (error.response.data) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage(`Unable to complete ${action.toLowerCase()}. Please try again.`);
      }
    } else if (error.request) {
      setErrorMessage("The server is currently unreachable. Please check your network connection.");
    } else {
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
    setStatus("registered");
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* AuthStatus handles the authentication status and updates the component state */}
      <AuthStatus setStatus={setStatus} />

      <div className={styles.container}>
        <div className={styles.card}>
          {status === "not_registered" && (
            <>
              <h2 className={styles.title}>Register</h2>
              <p className={styles.message}>
                This service supports only WebAuthn/FIDO2 passkeys to ensure the highest level
                of privacy and security.
              </p>
              {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
              {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.inputField}
                required
              />
              <button
                onClick={handleRegister}
                disabled={loading}
                className={styles.button}
              >
                {loading ? "Registering..." : "Register"}
              </button>
              <p
                onClick={() => setStatus("registered")}
                className={styles.clickableText}
              >
                Already have an account? Log In
              </p>
            </>
          )}

          {status === "registered" && (
            <>
              <h2 className={styles.title}>Login</h2>
              <p className={styles.message}>Use your passkey to log in securely.</p>
              {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
              {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.inputField}
                required
              />
              <button
                onClick={handleLogin}
                disabled={loading}
                className={styles.button}
              >
                {loading ? "Authenticating..." : "Log In"}
              </button>
              <p
                onClick={() => setStatus("not_registered")}
                className={styles.clickableText}
              >
                Don’t have an account? Register
              </p>
            </>
          )}

          {status === "registering" && (
            <p>Registering... Please follow the instructions.</p>
          )}
          {status === "authenticating" && (
            <p>Authenticating... Please follow the instructions.</p>
          )}
        </div>
      </div>
    </Suspense>
  );
}
