import React from "react";

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
// data = { name: "", value: [{name: 'Name', value: [] }] }
const Card: React.FC<CardProps> = ({ title, data, onScroll }) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>
        <div className={styles.header_container}>
          <div className={styles.header_spacing}>&nbsp;</div>
          <div className={styles.header}>{data.name}</div>
        </div>
        <div className={styles.content_container}>
          {data.values?.map((el, index) => {
            return (
              <div onScroll={onScroll} className={styles.values} key={index}>
                <div className={styles.header_spacing}>{index + 1}</div>
                <div className={styles.content_value}>{el}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Card;
