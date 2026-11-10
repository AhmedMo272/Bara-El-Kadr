import mascotImage from "../../assets/mascot-running.png";
import styles from "./Mascot.module.css";

export default function Mascot({ pose = "run", size = 220, className = "" }) {
  const cls = `${styles.mascot} ${styles[pose] || ""} ${className}`;

  return (
    <img
      className={cls}
      src={mascotImage}
      width={size}
      height={size}
      alt="Bara El Kadr mascot"
      draggable="false"
    />
  );
}
