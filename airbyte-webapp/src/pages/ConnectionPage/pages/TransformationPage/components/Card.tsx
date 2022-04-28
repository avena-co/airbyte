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
  onCardItemClick: (data: any, index: number) => void;
};

const Card: React.FC<CardProps> = ({ title, data, onCardItemClick }) => {
  const maxNum = data.reduce(function (previousValue, currentValue) {
    if (previousValue < currentValue.values.length) {
      return currentValue.values.length;
    }
    return previousValue;
  }, 0);

  const handleMouseEnter = (e: any): void => {
    const domElement = e.target;
    domElement.style.background = "rgb(152, 198, 255)";
  };

  const handleMouseLeave = (e: any): void => {
    const domElement = e.target;
    domElement.style.background = "white";
  };

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
          <div className={styles.content_container}>
            {[...Array(maxNum)].map((el, ind) => {
              console.log(el);
              return (
                <div className={styles.values}>
                  {data.map((d, index) => {
                    if (index === 0) {
                      return (
                        <>
                          <div className={styles.header_spacing}>{ind + 1}</div>
                          <div
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => onCardItemClick(d, index)}
                            className={styles.content_value}
                          >
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
