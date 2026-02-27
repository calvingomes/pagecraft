"use client";

import styles from "./AuthView.module.css";

type AuthViewProps = {
  handleGoogleSignIn: () => Promise<void>;
};

const AuthView = ({ handleGoogleSignIn }: AuthViewProps) => {
  return (
    <div className={styles.authViewContainer}>
      <div className={styles.authViewContent}>
        <div className={styles.authViewContentContainer}>
          <h1 className={styles.welcomeText}>Welcome back!</h1>
          <p className={styles.welcomeSubtitle}>
            Simplify your profile building and get started quickly.
          </p>
          <input type="text" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button>Hello</button>
          <div className={styles.divider}>or continue with</div>
          <button onClick={handleGoogleSignIn}>Continue with Google</button>
        </div>
      </div>
      <div className={styles.authViewImage}></div>
    </div>
  );
};

export default AuthView;
