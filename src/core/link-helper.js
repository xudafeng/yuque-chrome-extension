const LinkHelper = {
  goDoc: (doc, host = '') => `${host}/go/doc/${doc.id}`,
  goMyNote: (host = '') => `${host}/dashboard/notes`,
  goMyPage: (account) => `${account.protocol}://${account.hostname}/${account.login}`,
};

export default LinkHelper;
