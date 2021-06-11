import TurndownService from 'turndown';
import marked from 'marked';

const formatHTML = html => {
  const turndownService = new TurndownService();
  const md = turndownService.turndown(html);
  return marked(md);
};

export default formatHTML;
