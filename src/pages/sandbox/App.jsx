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
    resolve(res[STORAGE_KEYS.CURRENT_ACCOUNT] || {});
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
    getCurrentAccount()
      .then(account => {
        setAccount(account);
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
        <span className={styles.version}>
          v{process.env.VERSION}
          <span className={styles.buildtime}>
            /{process.env.BUILD_TIME}
          </span>
        </span>
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
                tab={__('??????')}
                key="save-to"
              >
                <SaveTo />
              </TabPane>
              <TabPane
                tab={__('????????????')}
                key="color-theme"
              >
                <ColorTheme />
              </TabPane>
              <TabPane
                tab={(
                  <span>
                    <ExperimentOutlined />
                    {__('??????')}
                  </span>
                )}
                key="others"
              >
                {__('????????????')}
              </TabPane>
            </Tabs>
          </>
        ) : <Login onConfirm={onSelectAccount} />}
      </div>
      {account.id && (
        <div className={styles.account}>
          <FeedBack />
          <UserInfo
            user={account}
            onLogout={onLogout}
          />
        </div>
      )}
    </div>
  );
};

export default App;
