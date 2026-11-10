import styles from "./EmptyState.module.css";
import Mascot from "../mascot/Mascot";

export default function EmptyState({ text }) {
  return (
    <div className={styles.box}>
      <Mascot pose="idle" size={110} />
      <p>{text}</p>
    </div>
  );
}
