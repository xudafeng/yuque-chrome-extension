const formatMD = md => md
  .filter(item => item.text !== '\n')
  .map(item => {
    if (item.text) {
      item.text = item.text.replace(/\n[\n]+/g, '\n');
    }
    return item;
  });

export default formatMD;
