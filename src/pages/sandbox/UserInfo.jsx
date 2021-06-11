import React from 'react';
import { Avatar, Menu, Popover } from 'antd';
import PropTypes from 'prop-types';
import { LogoutOutlined } from '@ant-design/icons';
import styles from './UserInfo.module.less';

const UserInfo = (props) => {
  const { user, onLogout } = props;
  const menu = (
    <>
      <div className={styles.info}>
        <div className={styles.title}>
          {user.name}
        </div>
        <div className={styles.login}>
          {user.login}
        </div>
      </div>
      <Menu>
        <Menu.Item
          onClick={onLogout}
        >
          <LogoutOutlined />
          <span>{__('切换账户')}</span>
        </Menu.Item>
      </Menu>
    </>
  );
  return (
    <Popover
      overlayClassName={styles.popover}
      type="menu"
      content={menu}
      placement="bottomRight"
      getPopupContainer={node => node.parentNode}
    >
      <div className={styles.wrapper}>
        <Avatar src={user.avatar_url} size={24} />
        <span className={styles.name}>
          {user.name}
        </span>
      </div>
    </Popover>
  );
};

UserInfo.propTypes = {
  user: PropTypes.object.isRequired,
};

export default UserInfo;
