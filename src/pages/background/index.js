import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';
import { siteName } from '@/config';
import './browser-action';
import './context-menu';
import './request';

const getHostNames = () => new Promise(resolve => {
  Chrome.cookies.getAll({}, res => {
    const hostnames = res
      .map(item => item.domain.replace(/^\W+/, ''))
      .filter(item => new RegExp(`^${siteName}\\.`).test(item));
    resolve(Array.from(new Set(hostnames)));
  });
});

Chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  switch (request.action) {
    case GLOBAL_EVENTS.GET_ACCOUNT_HOSTS:
      getHostNames().then(sendResponse);
      return;
    default:
      return;
  }
});