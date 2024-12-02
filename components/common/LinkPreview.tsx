import React from "react";
import styles from "@styles/components/_common.module.scss";

const LinkPreview = (url: string) => {
  if (!url) return null;

  return (
    <div className={styles.linkPreview}>
      <iframe
        src={url}
        title="Link Preview"
        sandbox="allow-same-origin allow-scripts"
        className={styles.linkPreviewFrame}
      />
    </div>
  );
};

export default LinkPreview;
