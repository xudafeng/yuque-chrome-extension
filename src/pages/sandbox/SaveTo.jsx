import React, { useState, useEffect } from 'react';
import { Button, Radio, Select, message } from 'antd';
import { get as safeGet } from 'lodash';
import Chrome from '@/core/chrome';
import request from '@/core/request';
import LinkHelper from '@/core/link-helper';
import Editor from '@/components/editor/Editor';
import serialize from '@/components/editor/serialize';
import deserialize from '@/components/editor/deserialize';
import formatHTML from '@/components/editor/format-html';
import { STORAGE_KEYS } from '@/config';
import { GLOBAL_EVENTS } from '@/events';
import styles from './SaveTo.module.less';

window.__ = text => text;

let editorInstance;

const getCurrentTab = () => new Promise(resolve => {
  Chrome.tabs.getCurrent(tab => {
    resolve(tab);
  });
});

const getPageHTML = () => new Promise(resolve => {
  getCurrentTab().then(tab => {
    Chrome.tabs.sendMessage(tab.id, {
      action: GLOBAL_EVENTS.GET_PAGE_HTML,
    }, (html) => {
      resolve(html);
    });
  });
});

const getCurrentAccount = () => new Promise(resolve => {
  Chrome.storage.local.get(STORAGE_KEYS.CURRENT_ACCOUNT, (res = {}) => {
    resolve(res[STORAGE_KEYS.CURRENT_ACCOUNT]);
  });
});

const NOTE_DATA = {
  id: 0,
  name: __('小记'),
};

const SELECT_TYPES = [
  {
    key: 'bookmark',
    text: __('书签'),
  },
  {
    key: 'area-select',
    text: __('选取'),
  },
  {
    key: 'all-page',
    text: __('整个页面'),
  },
];

const useViewModel = () => {
  const [books, setBooks] = useState([NOTE_DATA]);
  const [currentBookId, setCurrentBookId] = useState(NOTE_DATA.id);
  const [currentType, setCurrentType] = useState(SELECT_TYPES[0].key);
  const [editorValue, setEditorValue] = useState([]);

  const onSelectType = setCurrentType;

  useEffect(() => {
    request('/api/mine/personal_books?limit=200&offset=0')
      .then(({ data }) => {
        setBooks([
          NOTE_DATA,
          ...data.data,
        ]);
      });
  }, []);

  useEffect(() => {
    Chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      switch (request.action) {
        case GLOBAL_EVENTS.GET_SELECTED_HTML: {
          const { html } = request;
          const newHtml = formatHTML(html);
          const document = new window.DOMParser().parseFromString(newHtml, 'text/html');
          const value = deserialize(document.body);
          const newEditorValue = editorValue.slice().concat(value);
          setEditorValue(newEditorValue);
          sendResponse(true);
          return;
        }
        default:
          sendResponse(true);
      }
    });
  }, []);

  useEffect(() => {
    if (currentType === SELECT_TYPES[0].key) {
      getCurrentTab().then(tab => {
        // https://github.com/ianstormtaylor/slate/blob/main/site/examples/markdown-shortcuts.tsx
        setEditorValue([
          {
            type: 'heading-two',
            children: [
              {
                text: tab.title,
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                url: tab.url,
                children: [
                  {
                    text: tab.title,
                  },
                ],
              },
            ],
          },
        ]);
      });
    } else if (currentType === SELECT_TYPES[1].key) {
      getCurrentTab().then(tab => {
        Chrome.tabs.sendMessage(tab.id, {
          action: GLOBAL_EVENTS.START_SELECT,
        });
      });
    } else if (currentType === SELECT_TYPES[2].key) {
      getPageHTML().then(res => {
        const html = formatHTML(res);
        const document = new window.DOMParser().parseFromString(html, 'text/html');
        const value = deserialize(document.body);
        setEditorValue(value);
      });
    }
  }, [
    currentType,
  ]);

  const onSave = () => {
    if (!editorInstance) return;
    const fragment = serialize(editorInstance);

    if (currentBookId === NOTE_DATA.id) {
      request('/api/notes/status')
        .then(({ data }) => {
          const noteId = safeGet(data, 'meta.mirror.id');
          request(`/api/notes/${noteId}`, {
            method: 'PUT',
            data: {
              body_asl: fragment,
              body_html: fragment,
              description: fragment,
              save_type: 'user',
            },
          })
            .then(() => {
              getCurrentAccount().then(({ protocol, hostname }) => {
                const url = LinkHelper.goMyNote(`${protocol}://${hostname}`);
                message.success(
                  <span>
                    {__('保存成功')}，
                    <a target="_blank" href={url}>
                      {__('去小记查看')}
                    </a>
                  </span>
                );
              });
            })
            .catch(() => {
              message.error(__('保存失败'));
            });
        });
    } else {
      getCurrentTab().then(tab => {
        request('/api/docs', {
          method: 'POST',
          data: {
            title: __(`[来自收藏] ${tab.title}`),
            type: 'Doc',
            format: 'lake',
            status: 1,
            book_id: currentBookId,
            body_draft_asl: fragment,
            body_asl: fragment,
            body: fragment,
          },
        })
          .then(({ data }) => {
            getCurrentAccount().then(({ protocol, hostname }) => {
              const url = LinkHelper.goDoc(data.data, `${protocol}://${hostname}`);
              message.success(
                <span>
                  {__('保存成功')}，
                  <a target="_blank" href={url}>
                    {__('立即查看')}
                  </a>
                </span>
              );
            });
          })
          .catch(() => {
            message.error(__('保存失败'));
          });
      });
    }
  };

  const onSelectBookId = setCurrentBookId;

  return {
    state: {
      books,
      editorValue,
      currentBookId,
    },
    onSave,
    onSelectType,
    onSelectBookId,
  };
};

const SaveTo = (props) => {
  const {
    state: {
      books,
      editorValue,
      currentBookId,
    },
    onSelectBookId,
    onSave,
    onSelectType,
  } = useViewModel(props);

  return (
    <div className={styles.wrapper}>
      <Radio.Group
        defaultValue={SELECT_TYPES[0].key}
        buttonStyle="solid"
        size="small"
        onChange={e => onSelectType(e.target.value)}
      >
        {SELECT_TYPES.map(item => <Radio.Button value={item.key}>{item.text}</Radio.Button>)}
      </Radio.Group>
      <Button
        className={styles.save}
        type="primary"
        block
        onClick={onSave}
      >
        {__('保存到')}
        {currentBookId === NOTE_DATA.id ? __('小记') : __('知识库')}
      </Button>
      <Select
        className={styles.list}
        onChange={onSelectBookId}
        defaultValue={books.find(book => book.id === currentBookId)?.name}
      >
        {books.map(book => <Select.Option value={book.id}>{book.name}</Select.Option>)}
      </Select>
      <div className={styles.editor}>
        <Editor
          onLoad={editor => editorInstance = editor}
          defaultValue={editorValue}
        />
      </div>
    </div>
  );
};

export default SaveTo;
