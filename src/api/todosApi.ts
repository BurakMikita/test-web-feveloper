
import axios from 'axios';

// Базовый URL
const BASE_URL = 'https://jsonplaceholder.typicode.com/todos';

// Определяем API-запросы
export const todosApi = {
  async fetchTodos(limit: number = 10) {
    const response = await axios.get(`${BASE_URL}?_limit=${limit}`);
    return response.data;
  },

  async fetchTodo(id: number) {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  async deleteTodo(id: number) {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  async toggleStatus(id: number, completed: boolean) {
    const response = await axios.patch(`${BASE_URL}/${id}`, {
      completed,
    });
    return response.data;
  },

  async addNewTodo(todo: { title: string; userId: number; completed: boolean }) {
    const response = await axios.post(BASE_URL, todo);
    return response.data;
  },
};