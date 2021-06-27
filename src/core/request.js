import axios from 'axios';
import Chrome from '@/core/chrome';
import { pkg, STORAGE_KEYS, REQUEST_HEADER_VERSION } from '@/config';

const getCurrentAccount = () => new Promise(resolve => {
  Chrome.storage.local.get(STORAGE_KEYS.CURRENT_ACCOUNT, (res = {}) => {
    resolve(res[STORAGE_KEYS.CURRENT_ACCOUNT]);
  });
});

export default async function request(url, options = {}) {
  const headers = {
    [REQUEST_HEADER_VERSION]: pkg.version,
  };
  const defaultOptions = {
    headers,
    timeout: 3E3,
  };
  const account = await getCurrentAccount();
  if (account) {
    defaultOptions.baseURL = `${account.protocol}://${account.hostname}`;
  }
  const newOptions = {
    validateStatus: false,
    withCredentials: true,
    url,
    ...defaultOptions,
    ...options,
  };

  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    newOptions.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...newOptions.headers,
    };
  }

  return axios(newOptions);
}
