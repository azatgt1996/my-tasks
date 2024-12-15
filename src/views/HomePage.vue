<template>
  <Menu />
  <IonPage id="main-content">
    <IonHeader>
      <IonToolbar v-show="!selected.length">
        <MenuBtn />
        <IonTitle>{{ tr.myTasks }}{{ filtered.length ? `: ${filtered.length}` : '' }}</IonTitle>
        <UiSelect slot="end" interface="popover" v-model="category" class="mr-10" style="max-width: 44%">
          <SelectOption v-for="val in categories" :value="val" :label="getCategoryName(val)" />
          <SelectOption class="primary" value="" :label="`+ ${tr.newCategory}`" />
        </UiSelect>
      </IonToolbar>
      <GroupAction :data="filtered" />

      <SearchAndFilter :disabled style="--inner-padding-end: 3px" />
      <AddTaskInput :disabled @change="addTask" style="--inner-padding-end: 3px" />
    </IonHeader>

    <IonContent>
      <div v-show="loading" class="flex-center">
        <IonSpinner name="lines" />
      </div>
      <SlidableCheckList v-model="selected" :data="filtered" :withVibro="params.vibro" rightIcon="trashO"
        :leftIcon="task => task.completed ? 'arrowUndoCO' : 'checkmarkCO'" @to-left="toggleCompleted"
        @to-right="deleteTask" @click-item="task => $bus.open('TaskModal', task)">
        <template #item="task">
          <TaskItem :task />
        </template>
      </SlidableCheckList>
      <IonLabel v-show="!filtered.length" class="flex-center" color="medium" style="font-size: x-large">
        {{ listStatus }}
      </IonLabel>
    </IonContent>
    <IonProgressBar v-show="cancelTimer" :value="cancelTimer" color="secondary" />
  </IonPage>

  <TaskModal :data="filtered" @delete="deleteTask" @save="saveTask" />
  <CategoriesModal />
</template>

<script setup>
import { useBackButton, IonContent, IonHeader, IonToolbar, IonProgressBar, IonSpinner, IonLabel, IonPage, IonTitle } from '@ionic/vue';
import { MenuBtn, SelectOption } from "@/components/renderFunctions.js";
import { App } from '@capacitor/app';
import { computed, onMounted, ref, toRefs } from "vue";
import { nanoid } from "nanoid";
import { $bus, delay, getNumId, removeNotifications } from "@/helpers/utils.js";
import { useActionWithCancel } from "@/helpers/actionWithCancel"
import { emptyDatetime } from "@/helpers/constants.js";
import { useGlobalStore } from "@/stores/globalStore";
import { useTaskStore } from "@/stores/taskStore";
import { useCategoryStore } from "@/stores/categoryStore";
import UiSelect from "@/components/UiSelect.vue";
import SearchAndFilter from "@/components/SearchAndFilter.vue";
import GroupAction from "@/components/GroupAction.vue";
import Menu from "@/components/Menu.vue";
import SlidableCheckList from '@/components/SlidableCheckList.vue';
import TaskItem from '@/components/TaskItem.vue';
import AddTaskInput from '@/components/AddTaskInput.vue';
import TaskModal from '@/modals/TaskModal.vue';
import CategoriesModal from '@/modals/CategoriesModal.vue';

const { cancelTimer, execute } = useActionWithCancel()
const { tr, params, storage, toast, errToast, confirm } = useGlobalStore()
const { tasks, setTasks, saveTasks, changeNotification } = useTaskStore()
const { selected, filtered, listStatus } = toRefs(useTaskStore())
const disabled = computed(() => selected.value.length > 0)

const { getCategoryName } = useCategoryStore()
const { category, categories } = toRefs(useCategoryStore())
const loading = ref(true)

const addTask = (title) => {
  const _category = category.value === 'allCategories' ? 'common' : category.value
  const now = new Date().toISOString()

  const newTask = {
    id: nanoid(), title, description: '', priority: 'low', completed: false,
    category: _category, created: now, changed: now, notification: emptyDatetime
  }
  tasks.push(newTask)
  saveTasks()
  toast(tr.taskAdded)
}

const saveTask = (task) => {
  task.title = task.title.trim()
  if (!task.title) return errToast(tr.titleIsEmpty)

  const idx = tasks.findIndex(it => it.id === task.id)
  task.changed = new Date().toISOString()
  tasks[idx] = task

  changeNotification(task)
  saveTasks()
  toast(tr.taskChanged)
}

const deleteTask = (task) => {
  let idx, deleted
  execute(tr.taskDeleted, () => {
    idx = tasks.findIndex(it => it.id === task.id)
    deleted = tasks[idx]
    tasks.splice(idx, 1)
    saveTasks(1)
  }, () => {
    const _id = getNumId(deleted)
    removeNotifications([_id])
  }, () => {
    tasks.splice(idx, 0, deleted)
    saveTasks(2)
  })
}

const toggleCompleted = async (task) => {
  const idx = tasks.findIndex(it => it.id === task.id)

  await delay(200)
  tasks[idx].completed = !task.completed
  tasks[idx].changed = new Date().toISOString()

  changeNotification(tasks[idx])

  saveTasks()
  toast(!task.completed ? tr.taskCompleted : tr.taskUncompleted)
}

$bus.on('deleteAll', async () => {
  if (!await confirm(tr.aysToDelete)) return

  const ids = tasks.map(getNumId)
  removeNotifications(ids)

  setTasks([])
  saveTasks(1)
  toast(tr.allDeleted)
})

$bus.on('deleteAllCompleted', async () => {
  if (!await confirm(tr.aysToDeleteAllCompleted)) return

  const uncompletedTasks = tasks.filter(it => !it.completed)
  const completedTasks = tasks.filter(it => it.completed)
  setTasks(uncompletedTasks)
  saveTasks(1)
  toast(tr.allCompletedDeleted)

  const ids = completedTasks.map(getNumId)
  removeNotifications(ids)
})

onMounted(async () => {
  const _tasks = await storage.get('tasks')
  tasks.push(...(_tasks ? JSON.parse(_tasks) : []))
  loading.value = false
})

useBackButton(-1, () => {
  if (selected.value.length) return selected.value = []
  App.exitApp()
})
</script>