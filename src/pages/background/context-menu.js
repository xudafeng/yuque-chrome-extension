import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';
import { message } from 'antd';

window.__ = text => text;

// https://developer.chrome.com/docs/extensions/reference/contextMenus/

const menuList = [{
  id: 'save-to-yuque-notes',
  title: __('保存到语雀小记'),
  contexts: [
    'selection',
  ],
}, {
  id: 'save-to-yuque',
  title: __('保存到语雀'),
  contexts: ['page'],
}];

menuList.forEach(item => Chrome.contextMenus.create(item));

Chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case menuList[0].id:
      const { pageUrl, selectionText } = info;
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.SAVE_TO_NOTE,
        pageUrl,
        selectionText,
      });
      break;
    case menuList[1].id:
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.SHOW_BOARD,
      });
      break;
  }
});