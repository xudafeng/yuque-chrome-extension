import request from '@/core/request';

const RequestProxy = {
  async getMineInfo(options = {}) {
    return await request('/api/mine', {
      method: 'GET',
      ...options,
    });
  },
  doc: {
    async saveDoc(data = {}) {
      return await request('/api/docs', {
        method: 'POST',
        data: {
          type: 'Doc',
          format: 'lake',
          status: 1,
          ...data,
        },
      });
    },
  },
  book: {
    async getBooks() {
      return await request('/api/mine/personal_books', {
        method: 'GET',
        data: {
          limit: 200,
          offset: 0,
        },
      });
    },
  },
  note: {
    async getStatus() {
      return await request('/api/notes/status', {
        method: 'GET',
      });
    },
    async updateNote(id, params) {
      return await request(`/api/notes/${id}`, {
        method: 'PUT',
        data: {
          save_type: 'user',
          ...params,
        },
      });
    },
  },
};

module.exports = RequestProxy;
