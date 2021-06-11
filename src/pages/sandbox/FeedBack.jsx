import React from 'react';
import {
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { pkg } from '@/config';
import styles from './FeedBack.module.less';

const FeedBack = () => (
  <div className={styles.wrapper}>
    <span className={styles.icon}>
      <QuestionCircleOutlined />
    </span>
    <span className={styles.text}>
      <a
        target="_blank"
        href={pkg.issues}
      >
        {__('问题反馈')}
      </a>
    </span>
  </div>
);

export default FeedBack;
