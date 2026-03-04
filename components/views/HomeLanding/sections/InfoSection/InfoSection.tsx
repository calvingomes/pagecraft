import layoutStyles from "../../LandingLayout.module.css";
import styles from "./InfoSection.module.css";

export function InfoSection() {
  return (
    <section className={layoutStyles.section} aria-label="Product info">
      <div className={`${layoutStyles.containerNarrow} ${styles.container}`}>
        <div id="products" className={styles.panel}>
          <h2 className={styles.title}>Products</h2>
          <p className={styles.subtitle}>
            Mix text, links, and images with simple blocks—then publish a
            profile that feels custom.
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Text, link, and image blocks</li>
            <li className={styles.listItem}>Responsive layout by default</li>
            <li className={styles.listItem}>Clean, shareable URLs</li>
          </ul>
        </div>

        <div id="customers" className={styles.panel}>
          <h2 className={styles.title}>Customers</h2>
          <p className={styles.subtitle}>
            Built for people who want a polished presence without managing a
            full website.
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Creators and freelancers</li>
            <li className={styles.listItem}>Founders and indie makers</li>
            <li className={styles.listItem}>Teams shipping a simple hub</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
