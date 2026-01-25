import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.heading}>Welcome to PageCraft</h1>
      <p className={styles.paragraph}>
        Build and share a beautiful single-page profile with PageCraft.
      </p>
    </header>
  );
};

export { Header };
