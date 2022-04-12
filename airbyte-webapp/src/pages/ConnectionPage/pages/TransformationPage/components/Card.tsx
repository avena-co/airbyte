import React from "react";
import { ScrollSyncNode } from "scroll-sync-react";

import styles from "./card.module.css";

interface Column {
  name: string;
  values: string[];
}

type CardProps = {
  title: string;
  data: Column;
  onScroll: (e: React.UIEvent<HTMLElement> | undefined) => void;
};

const Card: React.FC<CardProps> = ({ title, data, onScroll }) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>
        <div className={styles.header_container}>
          <div className={styles.header_spacing}>&nbsp;</div>
          <div className={styles.header}>{data.name}</div>
        </div>
        <ScrollSyncNode>
          <div onScroll={onScroll} className={styles.content_container}>
            {data.values?.map((el, index) => {
              return (
                <div className={styles.values} key={index}>
                  <div className={styles.header_spacing}>{index + 1}</div>
                  <div className={styles.content_value}>{el}</div>
                </div>
              );
            })}
          </div>
        </ScrollSyncNode>
      </div>
    </div>
  );
};

export default Card;
