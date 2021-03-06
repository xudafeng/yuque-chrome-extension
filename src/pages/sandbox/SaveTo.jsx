import React, { useState, useEffect } from 'react';
import { Button, Radio, Select, message } from 'antd';
import { get as safeGet, isEmpty } from 'lodash';
import Chrome from '@/core/chrome';
import proxy from '@/core/proxy';
import LinkHelper from '@/core/link-helper';
import Editor from '@/components/editor/Editor';
import serialize from '@/components/editor/serialize';
import deserialize from '@/components/editor/deserialize';
import formatHTML from '@/components/editor/format-html';
import formatMD from '@/components/editor/format-md';
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
  const [showContinueButton, setShowContinueButton] = useState(false);

  const onSelectType = setCurrentType;

  const startSelect = () => {
    getCurrentTab().then(tab => {
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.START_SELECT,
      });
    });
  };

  useEffect(() => {
    proxy.book.getBooks()
      .then(({ data }) => {
        setBooks([
          NOTE_DATA,
          ...data.data,
        ]);
      });
  }, []);

  const onReviceMessage = (request, _, sendResponse) => {
    switch (request.action) {
      case GLOBAL_EVENTS.GET_SELECTED_HTML: {
        const { html } = request;
        const newHtml = formatHTML(html);
        const document = new window.DOMParser().parseFromString(newHtml, 'text/html');
        const value = deserialize(document.body);
        setEditorValue([
          ...editorValue,
          ...formatMD(value),
        ]);
        sendResponse(true);
        return;
      }
      default:
        sendResponse(true);
    }
  };

  useEffect(() => {
    Chrome.runtime.onMessage.addListener(onReviceMessage);
    return () => {
      Chrome.runtime.onMessage.removeListener(onReviceMessage);
    };
  }, [
    editorValue,
  ]);

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
      startSelect();
    } else if (currentType === SELECT_TYPES[2].key) {
      getPageHTML().then(res => {
        const html = formatHTML(res);
        const document = new window.DOMParser().parseFromString(html, 'text/html');
        const value = deserialize(document.body);
        setEditorValue(formatMD(value));
      });
    }
  }, [
    currentType,
  ]);

  useEffect(() => {
    setShowContinueButton(currentType === SELECT_TYPES[1].key && !isEmpty(editorValue));
  }, [
    editorValue,
    currentType,
  ]);

  const onSave = () => {
    if (!editorInstance) return;
    const fragment = serialize(editorInstance);

    if (currentBookId === NOTE_DATA.id) {
      proxy.note.getStatus()
        .then(({ data }) => {
          const noteId = safeGet(data, 'meta.mirror.id');
          proxy.note.update(noteId, {
            body_asl: fragment,
            body_html: fragment,
            description: fragment,
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
        proxy.doc.create({
          title: __(`[来自收藏] ${tab.title}`),
          book_id: currentBookId,
          body_draft_asl: fragment,
          body_asl: fragment,
          body: fragment,
        }).then(({ data }) => {
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

  const onContinue = () => {
    startSelect();
  };

  const onSelectBookId = setCurrentBookId;

  return {
    state: {
      books,
      editorValue,
      currentBookId,
      showContinueButton,
    },
    onSave,
    onContinue,
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
      showContinueButton,
    },
    onSelectBookId,
    onSave,
    onContinue,
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
      <Select
        className={styles.list}
        onChange={onSelectBookId}
        defaultValue={books.find(book => book.id === currentBookId)?.name}
      >
        {books.map(book => <Select.Option value={book.id}>{book.name}</Select.Option>)}
      </Select>
      <Button
        className={styles.button}
        type="primary"
        block
        onClick={onSave}
      >
        {__('保存到')}
        {currentBookId === NOTE_DATA.id ? __('小记') : __('知识库')}
      </Button>
      {showContinueButton && (
        <Button
          className={styles.button}
          block
          onClick={onContinue}
        >
          {__('继续选取')}
        </Button>
      )}
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
