import styles from "./VideoSection.module.css";

export function VideoSection() {
  return (
    <section className={styles.videoSection}>
      <div className={styles.container}>
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
        >
          <source src="/videos/showcase.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}
