import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { useGlobalStore } from "@/stores/globalStore";
import { vibrate } from "@/helpers/utils.js";

export const useTaskStore = defineStore('taskStore', () => {
  const tasks = reactive([])
  const selected = ref([])
  const { params, storage } = useGlobalStore()

  const setTasks = (arr) => {
    tasks.length = 0
    Object.assign(tasks, arr)
  }

  const saveTasks = (isDel) => {
    tasks.length = tasks.length
    storage.set('tasks', JSON.stringify(tasks))
    selected.value = []

    if (isDel === 2) return
    if (params.sound) new Audio(isDel ? '/trash.mp3' : '/change.wav').play().catch(msg => console.log(msg))
    if (params.vibro) vibrate(22)
  }

  return { tasks, selected, setTasks, saveTasks }
})