import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import {
  CloseOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';
import { STORAGE_KEYS } from '@/config';
import UserInfo from './UserInfo';
import FeedBack from './FeedBack';
import SaveTo from './SaveTo';
import ColorTheme from './ColorTheme';
import Login from './Login';
import styles from './App.module.less';

window.__ = text => text;

const { TabPane } = Tabs;

const getCurrentAccount = () => new Promise(resolve => {
  Chrome.storage.local.get(STORAGE_KEYS.CURRENT_ACCOUNT, (res = {}) => {
    resolve(res[STORAGE_KEYS.CURRENT_ACCOUNT]);
  });
});

const useViewModel = () => {
  const [account, setAccount] = useState({});

  const onClose = () => {
    Chrome.tabs.getCurrent(tab => {
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.CLOSE_BOARD,
      });
    });
  };

  const onLogout = () => {
    Chrome.storage.local.remove(STORAGE_KEYS.CURRENT_ACCOUNT, () => {
      setAccount({});
    });
  };

  const onSelectAccount = setAccount;

  useEffect(() => {
    getCurrentAccount().then((res) => {
      setAccount(res[STORAGE_KEYS.CURRENT_ACCOUNT] || {});
    });
  }, []);

  return {
    state: {
      account,
    },
    onClose,
    onLogout,
    onSelectAccount,
  };
};

const App = (props) => {
  const {
    state: {
      account,
    },
    onClose,
    onLogout,
    onSelectAccount,
  } = useViewModel(props);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span
          className={styles.close}
          onClick={onClose}
        >
          <CloseOutlined />
        </span>
      </div>
      <div className={styles.items}>
        {account.id ? (
          <>
            <Tabs
              defaultActiveKey="save-to"
              size="small"
              type="card"
            >
              <TabPane
                tab={__('收藏')}
                key="save-to"
              >
                <SaveTo />
              </TabPane>
              <TabPane
                tab={__('颜色外观')}
                key="color-theme"
              >
                <ColorTheme />
              </TabPane>
              <TabPane
                tab={(
                  <span>
                    <ExperimentOutlined />
                    {__('其他')}
                  </span>
                )}
                key="others"
              >
                {__('即将上新')}
              </TabPane>
            </Tabs>
            <div className={styles.account}>
              <FeedBack />
              <UserInfo
                user={account}
                onLogout={onLogout}
              />
            </div>
          </>
        ) : <Login onConfirm={onSelectAccount} />}
      </div>
    </div>
  );
};

export default App;
