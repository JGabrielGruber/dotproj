import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"

const useTaskStore = create((set, get) => ({
  tasks: [
    // Sample tasks for testing
    { id: 'f5f23242-12e5-46ff-bd22-c2184628d5bf', title: 'Design homepage', description: 'Create wireframes', category: 'starred', step: 'backlog' },
    { id: '01a98452-4882-4f01-87d8-5ae2e5c95994', title: 'Fix API bug', description: 'Handle 500 errors', category: 'urgent', step: 'todo' },
    { id: '95fa6ae7-d5e7-436b-b165-564bbf928c84', title: 'Write docs', description: 'API documentation', category: 'completed', step: 'done' },
    { id: '25fdf247-58ec-47a8-b457-eb263b6581cd', title: 'Test features', description: 'Run unit tests', category: '', step: 'review' },
  ],
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: uuidv4() }],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  getTasks: (category = '') =>
    get().tasks.filter((task) => (category ? task.category === category : true)),
  getTask: (id) => get().tasks.find((task) => id === task.id),
}))

export default useTaskStore
