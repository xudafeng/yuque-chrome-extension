const LinkHelper = {
  goDoc: (doc, host = '') => `${host}/go/doc/${doc.id}`,
  goMyNote: (host = '') => `${host}/dashboard/notes`,
};

export default LinkHelper;
