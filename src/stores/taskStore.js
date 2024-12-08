import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { useGlobalStore } from "@/stores/globalStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { vibrate, getNumId, isLater, setNotification, removeNotifications } from "@/helpers/utils.js";
import { priorityType } from "@/helpers/constants.js";

export const useTaskStore = defineStore('taskStore', () => {
  const tasks = reactive([])
  const selected = ref([])
  const { tr, params, storage } = useGlobalStore()
  const { getCategoryName } = useCategoryStore()

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

  const changeNotification = (task) => {
    const _id = getNumId(task)
    const { notification, completed, priority, category, title } = task
    if (isLater(notification) && !completed) {
      const body = `${tr.category}: ${getCategoryName(category)}`
      setNotification(_id, title, body, notification, priorityType[priority])
    } else removeNotifications([_id])
  }

  return { tasks, selected, setTasks, saveTasks, changeNotification }
})