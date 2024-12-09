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

      <IonItem>
        <IonInput :placeholder="tr.search" v-model="keyword" :maxlength="50" clear-input :debounce="500" :disabled>
          <Ikon slot="start" color="medium" small :icon="params.searchInDesc ? 'searchC' : 'searchS'" />
          <IconBtn slot="end" size="small" icon="funnel" @click="$('#filterSelect').click()" :disabled
            :color="filters.length === 3 && isEqual(filters, priorities) ? 'medium' : 'primary'"
            style="margin-left: 0" />
        </IonInput>
        <FiltersSelect v-model="filters" />
      </IonItem>
      <IonItem lines="none">
        <IonInput ref="addTaskInput" :placeholder="tr.newTask" v-model="title" :disabled :maxlength="50" clear-input
          @keyup.enter="addTask(title)">
          <IconBtn slot="end" size="small" icon="addC" :color="!title?.trim() ? 'secondary' : 'primary'"
            @click="addTask(title)" :disabled style="margin-left: 0" />
        </IonInput>
      </IonItem>
    </IonHeader>

    <IonContent>
      <div v-show="loading" class="flex-center">
        <IonSpinner name="lines" />
      </div>
      <SlidingList v-model="selected" :data="filtered" :withVibro="params.vibro" rightIcon="trashO"
        :leftIcon="task => task.completed ? 'arrowUndoCO' : 'checkmarkCO'" @to-left="toggleCompleted"
        @to-right="deleteTask" @click-item="task => $bus.open('TaskModal', task)">
        <template #item="task">
          <IonLabel class="shorted-text" :class="{ 'striked-text': task.completed }">
            {{ task.title }}
          </IonLabel>
          <Ikon v-if="task.completed" icon="checkmarkCO" small style="margin-right: 2px" />
          <Ikon v-if="task.notification !== emptyDatetime" icon="alarmO" small style="margin-right: 2px"
            :style="{ color: isLater(task.notification) ? '' : 'orangered' }" />
          <Ikon icon="ellipse" :color="priorityType[task.priority]" style="font-size: 14px" />
        </template>
      </SlidingList>
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
import { useBackButton, IonContent, IonHeader, IonInput, IonToolbar, IonProgressBar, IonSpinner, IonItem, IonLabel, IonPage, IonTitle } from '@ionic/vue';
import { IconBtn, Ikon, MenuBtn, SelectOption } from "@/components/renderFunctions.js";
import { App } from '@capacitor/app';
import { computed, onMounted, ref, watch, toRefs } from "vue";
import { nanoid } from "nanoid";
import { isEqual, $, $bus, delay, getDT, isLater, getNumId, removeNotifications } from "@/helpers/utils.js";
import { useActionWithCancel } from "@/helpers/actionWithCancel"
import { emptyDatetime, priorityType, priorities, priorityNum } from "@/helpers/constants.js";
import { useGlobalStore } from "@/stores/globalStore";
import { useTaskStore } from "@/stores/taskStore";
import { useCategoryStore } from "@/stores/categoryStore";
import UiSelect from "@/components/UiSelect.vue";
import FiltersSelect from "@/components/FiltersSelect.vue";
import GroupAction from "@/components/GroupAction.vue";
import Menu from "@/components/Menu.vue";
import SlidingList from '@/components/SlidingList.vue';
import TaskModal from '@/modals/TaskModal.vue';
import CategoriesModal from '@/modals/CategoriesModal.vue';

const { cancelTimer, execute } = useActionWithCancel()
const { tr, params, storage, toast, errToast, confirm } = useGlobalStore()
const { tasks, setTasks, saveTasks, changeNotification } = useTaskStore()
const { selected } = toRefs(useTaskStore())
const disabled = computed(() => selected.value.length > 0)

const { getCategoryName } = useCategoryStore()
const { category, categories } = toRefs(useCategoryStore())
const loading = ref(true)

useBackButton(-1, () => {
  if (selected.value.length) return selected.value = []
  App.exitApp()
})

// #region Filter
const keyword = ref('')
const filters = ref([])

watch(filters, (val) => storage.set('filters', JSON.stringify(val)))

const grouped = computed(() => { // grouped by category
  if (category.value === 'allCategories') return tasks
  return tasks.filter(it => it.category === category.value)
})

const filtered = computed(() => {
  if (!grouped.value.length) return []

  const _filter = filters.value
  const _keyword = keyword.value.toLowerCase().trim()
  const { sortBy, orderByDesc, searchInDesc } = params

  const result = grouped.value.filter(it => {
    let res = it.title.toLowerCase().includes(_keyword)
    if (searchInDesc) res ||= it.description.toLowerCase().includes(_keyword)
    res &&= _filter.includes(it.priority)
    if (!_filter.includes('completed')) res &&= !it.completed
    if (_filter.includes('notificated')) res &&= isLater(it.notification)
    return res
  })

  return result.sort((t1, t2) => {
    if (orderByDesc) [t1, t2] = [t2, t1]
    if (sortBy === 'created') return new Date(t1.created) - new Date(t2.created)
    if (sortBy === 'changed') return new Date(t1.changed) - new Date(t2.changed)
    if (sortBy === 'title') return t1.title.localeCompare(t2.title)
    if (sortBy === 'priority') return priorityNum[t1.priority] - priorityNum[t2.priority]
    if (sortBy === 'notification') return getDT(t1.notification) - getDT(t2.notification)
  })
})

const listStatus = computed(() => {
  if (!grouped.value.length || !filtered.value.length && !keyword.value.trim()) return tr.emptyList
  if (!filtered.value.length) return tr.tasksNotFound
})
// #endregion

// #region Main
const title = ref(''), addTaskInput = ref()

const saveTask = (cur) => {
  cur.title = cur.title.trim()
  if (!cur.title) return errToast(tr.titleIsEmpty)

  const idx = tasks.findIndex(it => it.id === cur.id)
  cur.changed = new Date().toISOString()
  tasks[idx] = cur

  changeNotification(cur)

  toast(tr.taskChanged)
  saveTasks()
}

const addTask = (_title) => {
  _title = _title.trim()
  title.value = ''
  if (!_title) {
    if (addTaskInput.value.$el.className.includes('has-focus'))
      errToast(tr.titleIsEmpty)
    return addTaskInput.value.$el.setFocus()
  }

  const _category = category.value === 'allCategories' ? 'common' : category.value
  const now = new Date().toISOString()

  const newTask = {
    id: nanoid(), title: _title, description: '', priority: 'low', completed: false,
    category: _category, created: now, changed: now, notification: emptyDatetime
  }
  tasks.push(newTask)
  toast(tr.taskAdded)
  saveTasks()
}

const deleteTask = async (task) => {
  execute(tr.taskDeleted, () => {
    const idx = tasks.findIndex(it => it.id === task.id)
    const deleted = tasks[idx]
    tasks.splice(idx, 1)
    saveTasks(1)
    return { idx, deleted }
  }, ({ deleted }) => {
    const _id = getNumId(deleted)
    removeNotifications([_id])
  }, ({ idx, deleted }) => {
    tasks.splice(idx, 0, deleted)
    saveTasks(2)
  })
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

const toggleCompleted = async (task) => {
  const idx = tasks.findIndex(it => it.id === task.id)

  await delay(200)
  const isCompleted = !task.completed
  tasks[idx].completed = isCompleted
  tasks[idx].changed = new Date().toISOString()

  changeNotification(tasks[idx])

  saveTasks()
  toast(isCompleted ? tr.taskCompleted : tr.taskUncompleted)
}
// #endregion

onMounted(async () => {
  filters.value = JSON.parse(await storage.get('filters')) ?? priorities

  const _tasks = await storage.get('tasks')
  tasks.push(...(_tasks ? JSON.parse(_tasks) : []))
  loading.value = false
})
</script>

<style lang="sass">
#main-content > ion-header > ion-item
  --inner-padding-end: 3px

.full-label > label
  justify-content: space-between
  & > .native-wrapper
    max-width: fit-content

.flex-center
  display: flex
  align-items: center
  justify-content: center
  height: 100%
</style>