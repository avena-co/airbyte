import React from "react";
import { ScrollSyncNode } from "scroll-sync-react";

import styles from "./card.module.css";

interface Column {
  name: string;
  values: string[];
}

type CardProps = {
  title: string;
  data: Column[];
  onScroll: (e: React.UIEvent<HTMLElement> | undefined) => void;
};

const Card: React.FC<CardProps> = ({ title, data, onScroll }) => {
  const maxNum = data.reduce(function (previousValue, currentValue) {
    if (previousValue < currentValue.values.length) {
      return currentValue.values.length;
    }
    return previousValue;
  }, 0);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>
        <div className={styles.header_container}>
          <div className={styles.header_spacing}>&nbsp;</div>
          {data.map((el, ind) => {
            return (
              <div key={ind} className={styles.header}>
                {el?.name}
              </div>
            );
          })}
        </div>
        <ScrollSyncNode>
          <div onScroll={onScroll} className={styles.content_container}>
            {[...Array(maxNum)].map((el, ind) => {
              console.log(el);
              return (
                <div className={styles.values}>
                  {data.map((d, index) => {
                    if (index === 0) {
                      return (
                        <>
                          <div className={styles.header_spacing}>{ind + 1}</div>
                          <div className={styles.content_value}>
                            {d.values[ind]}
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <div className={styles.content_value}>
                          {d.values[ind]}
                        </div>
                      );
                    }
                  })}
                </div>
              );
            })}
            {/*
            <div className={styles.content_value}>{el}</div> */}
          </div>
        </ScrollSyncNode>
      </div>
    </div>
  );
};

export default Card;
