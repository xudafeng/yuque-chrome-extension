import React, {
  useState, useCallback, useMemo, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { Slate, Editable, withReact } from 'slate-react';
import {
  Editor as SlateEditor,
  Transforms,
  Range,
  Point,
  createEditor,
  Element as SlateElement,
} from 'slate';
import { withHistory } from 'slate-history';

const SHORTCUTS = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six',
};

const withShortcuts = editor => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = SlateEditor.above(editor, {
        match: n => SlateEditor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = SlateEditor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = SlateEditor.string(editor, range);
      const type = SHORTCUTS[beforeText];

      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        const newProperties = {
          type,
        };
        Transforms.setNodes(editor, newProperties, {
          match: n => SlateEditor.isBlock(editor, n),
        });

        if (type === 'list-item') {
          const list = {
            type: 'bulleted-list',
            children: [],
          };
          Transforms.wrapNodes(editor, list, {
            match: n => !SlateEditor.isEditor(n)
              && SlateElement.isElement(n)
              && n.type === 'list-item',
          });
        }

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = SlateEditor.above(editor, {
        match: n => SlateEditor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = SlateEditor.start(editor, path);

        if (
          !SlateEditor.isEditor(block)
          && SlateElement.isElement(block)
          && block.type !== 'paragraph'
          && Point.equals(selection.anchor, start)
        ) {
          const newProperties = {
            type: 'paragraph',
          };
          Transforms.setNodes(editor, newProperties);

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: n => !SlateEditor.isEditor(n)
                && SlateElement.isElement(n)
                && n.type === 'bulleted-list',
              split: true,
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>;
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>;
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'link':
      return (
        <a {...attributes} href={element.url}>
          {children}
        </a>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const useViewModel = (props) => {
  const [value, setValue] = useState([]);
  const editor = useMemo(() => withShortcuts(withReact(withHistory(createEditor()))), []);
  useEffect(() => {
    props.onLoad(editor);
  }, []);
  useEffect(() => {
    setValue(props.defaultValue);
  }, [
    props.defaultValue,
  ]);
  const onChange = value => {
    setValue(value);
  };
  return {
    state: {
      value,
    },
    editor,
    onChange,
  };
};

const CustomEditor = (props) => {
  const {
    state: {
      value,
    },
    editor,
    onChange,
  } = useViewModel(props);

  const renderElement = useCallback(props => <Element {...props} />, []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={onChange}
    >
      <Editable
        renderElement={renderElement}
        placeholder={__('请填写内容')}
        spellCheck
        autoFocus
      />
    </Slate>
  );
};

CustomEditor.propTypes = {
  defaultValue: PropTypes.array,
  onLoad: PropTypes.func.isRequired,
};

export default CustomEditor;
