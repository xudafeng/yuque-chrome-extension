import React, { useState, useEffect } from 'react';
import {
  Switch, Row, Col,
} from 'antd';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';
import styles from './ColorTheme.module.less';

const useViewModel = () => {
  const [darkMode, setDarkMode] = useState(false);
  const onChange = e => setDarkMode(e);
  useEffect(() => {
    Chrome.tabs.query({
      currentWindow: true,
    }, (tabs) => {
      tabs.map(tab => {
        Chrome.tabs.sendMessage(tab.id, {
          action: darkMode ? GLOBAL_EVENTS.ENABLE_DARK_MODE : GLOBAL_EVENTS.DISABLE_DARK_MODE,
        });
      });
    });
  }, [
    darkMode,
  ]);

  return {
    state: {
      darkMode,
    },
    onChange,
  };
};

const ColorTheme = (props) => {
  const {
    state: {
      darkMode,
    },
    onChange,
  } = useViewModel(props);

  return (
    <div className={styles.wrapper}>
      <Row
        justify="space-between"
      >
        <Col>
          {__('护眼模式')}
        </Col>
        <Col>
          <Switch
            defaultChecked={false}
            checked={darkMode}
            size="large"
            onChange={onChange}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ColorTheme;
