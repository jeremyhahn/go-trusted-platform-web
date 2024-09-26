"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie, deleteCookie } from "../../utils/cookie";
import styles from "./ProtectedPage.module.css";

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    const jwt = getCookie("jwt");
    if (!jwt) {
      router.push("/auth/webauthn");
    }
  }, [router]);

  const handleLogout = () => {
    deleteCookie("jwt");
    deleteCookie("uid");
    router.push("/auth/webauthn");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Protected Page</h2>
        <p className={styles.message}>
          Welcome! You have successfully accessed the protected content.
        </p>
        <button onClick={handleLogout} className={styles.button}>
          Log Out
        </button>
      </div>
    </div>
  );
}
