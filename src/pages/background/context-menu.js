import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';

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
  contexts: [
    'page',
  ],
}, {
  id: 'save-to-yuque-image',
  title: __('保存到语雀'),
  contexts: [
    'image',
  ],
}];

menuList.forEach(item => Chrome.contextMenus.create(item));

Chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case menuList[0].id: {
      const { pageUrl, selectionText } = info;
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.SAVE_TO_NOTE,
        pageUrl,
        selectionText,
      });
      break;
    }
    case menuList[1].id:
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.SHOW_BOARD,
      });
      break;
    case menuList[2].id: {
      const { srcUrl } = info;
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.SAVE_TO_NOTE_IMAGE,
        srcUrl,
      });
      break;
    }
    default:
      break;
  }
});
