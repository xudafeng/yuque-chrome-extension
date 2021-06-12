import React, { useState, useEffect } from 'react';
import {
  Button, Avatar, List,
} from 'antd';
import classnames from 'classnames';
import request from '@/core/request';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';
import { STORAGE_KEYS } from '@/config';
import FeedBack from './FeedBack';
import styles from './Login.module.less';

const Login = (props) => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState({});

  const onConfirm = () => {
    Chrome.storage.local.set({
      [STORAGE_KEYS.CURRENT_ACCOUNT]: selectedAccount,
    }, () => {
      props.onConfirm(selectedAccount);
    });
  };

  const genPromiseList = (hostnames) => Promise.all(hostnames.map(hostname => new Promise(resolve => {
    const protocol = 'https';
    const baseURL = `${protocol}://${hostname}`;
    const url = '/api/mine';
    request(url, {
      baseURL,
    })
      .then(({ data, status }) => {
        if (status === 200) {
          resolve({
            hostname,
            protocol,
            ...data.data,
          });
        } else {
          resolve({
            hostname,
            protocol,
            error: {},
          });
        }
      })
      .catch(e => {
        resolve({
          hostname,
          protocol,
          error: {
            ...e,
          },
        });
      });
  })));

  useEffect(() => {
    Chrome.runtime.sendMessage({
      action: GLOBAL_EVENTS.GET_ACCOUNT_HOSTS,
    }, (hostnames) => {
      genPromiseList(hostnames).then(accounts => {
        const avalibaleAccounts = accounts.filter(account => account.id);
        setAccounts(avalibaleAccounts);
        setLoading(false);
      });
    });
  }, []);

  const buttonDisabled = !selectedAccount.id;
  return (
    <div className={styles.wrapper}>
      <div>
        {__('请选择语雀账户')}
      </div>
      <List
        className={styles.list}
        loading={loading}
        itemLayout="horizontal"
        dataSource={accounts}
        renderItem={item => (
          <List.Item
            className={classnames({
              selected: item.id === selectedAccount.id,
            })}
            onClick={() => setSelectedAccount(item)}
          >
            <List.Item.Meta
              avatar={(
                <Avatar
                  src={item.avatar_url}
                  size={36}
                />
              )}
              title={(
                <div className={styles.title}>
                  <span>
                    {item.name}
                  </span>
                  <span className={styles.login}>
                    {item.login}
                  </span>
                </div>
              )}
              description={(
                <span>
                  {item.hostname}
                </span>
              )}
            />
          </List.Item>
        )}
      />
      <Button
        className={styles.button}
        type={buttonDisabled ? null : 'primary'}
        block
        onClick={onConfirm}
        disabled={buttonDisabled}
      >
        {__('确定')}
      </Button>
      <div className={styles.feedback}>
        <FeedBack />
      </div>
    </div>
  );
};

export default Login;
