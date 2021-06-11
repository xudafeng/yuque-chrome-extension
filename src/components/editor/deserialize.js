import { jsx } from 'slate-hyperscript';

const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  }

  let children = Array.from(el.childNodes).map(deserialize);

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  switch (el.nodeName) {
    case 'BODY':
      return jsx('fragment', {}, children);
    case 'BR':
      return '\n';
    case 'BLOCKQUOTE':
      return jsx('element', { type: 'quote' }, children);
    case 'P':
      return jsx('element', { type: 'paragraph' }, children);
    case 'A':
      return jsx('element', {
        type: 'link',
        url: el.getAttribute('href'),
      }, children);
    default:
      return el.textContent;
  }
};

export default deserialize;
