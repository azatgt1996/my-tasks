import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useTaskStore = defineStore('taskStore', () => {
    const tasks = reactive([])

    return { tasks }
})