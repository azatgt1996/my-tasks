import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useTaskStore = defineStore('taskStore', () => {
    const tasks = reactive([])
    const selected = ref([])

    return { tasks, selected }
})