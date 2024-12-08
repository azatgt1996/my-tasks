<template>
  <Menu />
  <IonPage id="main-content">
    <IonHeader>
      <IonToolbar v-show="!selected.length">
        <MenuBtn />
        <IonTitle>
          {{ tr.myTasks }}{{ filtered.length ? `: ${filtered.length}` : '' }}
        </IonTitle>
        <UiSelect slot="end" interface="popover" v-model="category" class="mr-10"
          style="max-width: 44%; padding-top: 3px">
          <IonSelectOption v-for="_category in categories" :value="_category">
            {{ baseCategories.includes(_category) ? tr[_category] : _category }}
          </IonSelectOption>
          <IonSelectOption class="new-category" value="">+ {{ tr.newCategory }}</IonSelectOption>
        </UiSelect>
      </IonToolbar>
      <IonToolbar v-show="selected.length" class="group-actions">
        <IconBtn slot="start" color="medium" icon="closeO" @click="selected = []" style="margin: 0 3px" />
        <IonTitle>{{ tr.selected }}: {{ selected.length }}</IonTitle>
        <IconBtn slot="end" color="primary" icon="checkmarkCO" @click="completeSelected" />
        <IconBtn slot="end" color="danger" icon="trashO" @click="deleteSelected" />
        <IconBtn slot="end" :color="selected.length === filtered.length ? 'success' : 'medium'" icon="checkmarkDoneO"
          @click="listRef.selectAll()" />
        <IconBtn id="more-btn" slot="end" color="medium" icon="ellipsisVertical" style="margin: 0 3px" />
        <IonPopover trigger="more-btn" dismiss-on-select size="auto">
          <IonContent>
            <IonList lines="none">
              <IconText icon="arrowUndoCO" :text="tr.uncompleteTasks" @click="uncompleteSelected" />
              <IconText icon="albumsO" :text="tr.changeCategory" @click="changeCategory" />
              <IconText icon="caretUpCO" :text="tr.changePriority" @click="changePriority" />
              <IconText icon="alarmO" :text="tr.changeNotification" @click="$bus.open('NotificationModal')" />
            </IonList>
          </IonContent>
        </IonPopover>
      </IonToolbar>

      <IonItem>
        <IonInput :placeholder="tr.search" v-model="keyword" :maxlength="taskLength" clear-input :debounce="500"
          :disabled="hasSelected">
          <Ikon slot="start" color="medium" small :icon="params.searchInDesc ? 'searchC' : 'searchS'" />
          <IconBtn slot="end" size="small" icon="funnel" @click="$('#filterSelect').click()" :disabled="hasSelected"
            :color="filters.length === 3 && isEqual(filters, priorities) ? 'medium' : 'primary'"
            style="margin-left: 0" />
        </IonInput>
        <UiSelect v-show="false" id="filterSelect" v-model="filters" multiple :header="tr.filters">
          <OptionsGroup :label="tr.byPriorities" />
          <IonSelectOption v-for="pr in priorities" :value="pr" :class="`${pr}-item`">
            {{ tr[pr] }}
          </IonSelectOption>
          <OptionsGroup :label="tr.others" />
          <IonSelectOption value="completed">{{ tr.completed }}</IonSelectOption>
          <IonSelectOption value="notificated">{{ tr.notificated }}</IonSelectOption>
        </UiSelect>
      </IonItem>
      <IonItem lines="none">
        <IonInput :placeholder="tr.newTask" v-model="title" :maxlength="taskLength" clear-input
          @keyup.enter="addTask(title)" :disabled="hasSelected" ref="addTaskInput">
          <IconBtn slot="end" size="small" icon="addC" :color="!title?.trim() ? 'secondary' : 'primary'"
            @click="addTask(title)" :disabled="hasSelected" style="margin-left: 0" />
        </IonInput>
      </IonItem>
    </IonHeader>

    <IonContent>
      <div v-show="loading" class="flex-center">
        <IonSpinner name="lines" />
      </div>
      <SlidingList ref="listRef" v-model="selected" :data="filtered" :withVibro="params.vibro" rightIcon="trashO"
        :leftIcon="task => task.completed ? 'arrowUndoCO' : 'checkmarkCO'" @to-left="task => toggleCompleted(task)"
        @to-right="task => deleteTask(task)" @click-item="task => openTask(task)">
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

  <UiModal name="TaskModal" icon="readerO" :title="tr.detailInfo" @dblClick="!disabledSave && saveTask(current)"
    @swipedLeft="filtered.at(-1)?.id !== current.id && nextTask()"
    @swipedRight="filtered[0]?.id !== current.id && prevTask()">
    <template #button>
      <IconBtn icon="saveO" :disabled="disabledSave" @click="saveTask(current)" />
    </template>
    <IonList @click.stop>
      <IonItem>
        <IonInput :label="tr.created" :value="localeDate(current.created)" readonly class="full-label" />
      </IonItem>
      <IonItem>
        <IonInput :label="tr.changed" :value="localeDate(current.changed)" readonly class="full-label" />
      </IonItem>
      <IonItem>
        <IonInput :label="tr.title" :placeholder="tr.typeTask" v-model="current.title" label-placement="fixed"
          :maxlength="taskLength" />
      </IonItem>
      <IonItem>
        <IonTextarea :label="tr.description" v-model="current.description" :rows="4" :placeholder="tr.typeDescription"
          clear-input label-placement="fixed" :maxlength="300" />
      </IonItem>
      <IonItem>
        <UiSelect v-model="current.category" :label="tr.category" :header="tr.selectCategory">
          <IonSelectOption v-for="_category in categories.slice(1)" :value="_category">
            {{ baseCategories.includes(_category) ? tr[_category] : _category }}
          </IonSelectOption>
        </UiSelect>
      </IonItem>
      <IonItem>
        <IonLabel>{{ tr.notification }}</IonLabel>
        <IonButton v-show="current.notification === emptyDatetime" color="light"
          @click="current.notification = getLateDate()" style="--box-shadow: 0">
          <Ikon icon="addO" />
          <Ikon icon="alarmO" small />
        </IonButton>
        <IonDatetimeButton v-show="current.notification !== emptyDatetime" datetime="datetime"
          :class="isLater(current.notification) ? '' : 'passed-date'" />
        <IconBtn v-show="current.notification !== emptyDatetime" color="danger" icon="closeCO"
          @click="current.notification = emptyDatetime" />
      </IonItem>
      <DateTimeModal id="datetime" v-model="current.notification" />
      <IonItem>
        <IonLabel>{{ tr.priority }}</IonLabel>
        <IonSegment v-model="current.priority" mode="ios">
          <IonSegmentButton v-for="value in priorities" :value="value">
            <IonLabel :color="priorityType[value]">{{ tr[value] }}</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </IonItem>
      <IonItem>
        <IonCheckbox v-model="current.completed" justify="space-between"
          :style="current.completed ? 'color: var(--ion-color-primary)' : ''">
          {{ tr.isCompleted }}
        </IonCheckbox>
      </IonItem>
      <IconText icon="trashO" :text="tr.delete" color="danger" @click="removeTask(current)" />
    </IonList>
    <template v-if="filtered.length > 1" #footer>
      <IconTextBtn size="small" style="width: 100%" :text="tr.prev" icon="caretBackO"
        :disabled="filtered[0]?.id === current.id" @click="prevTask" />
      <IconTextBtn size="small" style="width: 100%" :text="tr.next" icon="caretForwardO"
        :disabled="filtered.at(-1)?.id === current.id" iconPlace="end" @click="nextTask" />
    </template>
  </UiModal>

  <NotificationModal @changeNotifications="changeNotifications" />

  <UiModal name="CategoriesModal" icon="albumsO" :title="tr.categories">
    <template #button>
      <IonButton @click="addCategory()">{{ tr.add }}</IonButton>
    </template>
    <IonList>
      <IonItem>
        <IonLabel>
          {{ tr.common }}
          <IonNote>({{ tasks.filter(it => it.category === 'common').length }})</IonNote>
        </IonLabel>
      </IonItem>
      <IonReorderGroup :disabled="false" @ionItemReorder="onReorder">
        <IonItem v-for="_category in categories.slice(2)" :key="_category">
          <IonLabel class="shorted-text">
            {{ baseCategories.includes(_category) ? tr[_category] : _category }}
            <IonNote>({{ tasks.filter(it => it.category === _category).length }})</IonNote>
          </IonLabel>
          <IconBtn color="primary" size="small" icon="pencilO" @click="renameCategory(_category)" />
          <IconBtn color="danger" size="small" icon="trashO" @click="deleteCategory(_category)" />
          <IonReorder slot="end" :style="categories.slice(2).length === 1 ? 'pointer-events: none' : ''" />
        </IonItem>
      </IonReorderGroup>
    </IonList>
  </UiModal>
</template>

<script setup>
import {
  useBackButton, IonButton, IonContent, IonHeader, IonInput, IonToolbar, IonReorderGroup, IonReorder, IonCheckbox,
  IonProgressBar, IonNote, IonSelectOption, IonSpinner, IonPopover, IonItem, IonLabel, IonList, IonPage, IonTitle,
  IonDatetimeButton, IonSegment, IonSegmentButton, IonTextarea
} from '@ionic/vue';
import { App } from '@capacitor/app';
import { computed, onMounted, ref, watch, toRefs } from "vue";
import { nanoid } from "nanoid";
import { clone, isEqual, $, $bus, delay, log, arrayMove, getLateDate, getDT, isLater, getHexColor, vibrate } from "@/helpers/utils.js";
import { emptyDatetime } from "@/helpers/constants.js";
import { useGlobalStore } from "@/stores/globalStore";
import { useTaskStore } from "@/stores/taskStore";
import { LocalNotifications } from '@capacitor/local-notifications';
import { OptionsGroup, IconBtn, IconText, IconTextBtn, Ikon, MenuBtn } from "@/components/renderFunctions.js";
import UiSelect from "@/components/UiSelect.vue";
import DateTimeModal from "@/components/DateTimeModal.vue";
import UiModal from "@/components/UiModal.vue";
import Menu from "@/components/Menu.vue";
import SlidingList from '@/components/SlidingList.vue';
import NotificationModal from '@/modals/NotificationModal.vue';

const { tr, params, storage, localeDate, toast, errToast, cancelToast, confirm, prompt, prompt2 } = useGlobalStore()
const { tasks } = useTaskStore()
const { selected } = toRefs(useTaskStore())
const loading = ref(false)

/** Returns id (32bit integer) from task created date */
const getNumId = (task) => +(new Date(task.created).getTime().toString().slice(0, -3))

useBackButton(-1, () => {
  if (selected.value.length) return selected.value = []
  App.exitApp()
})

// #region Filter
const priorityType = { low: 'success', medium: 'warning', high: 'danger' }
const priorities = Object.keys(priorityType)
const keyword = ref('')
const filters = ref([])
const priorityNum = { low: 0, medium: 1, high: 2 }

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

// #region Category
const baseCategories = ['allCategories', 'common', 'private', 'work']
const categories = ref([])
const category = ref('allCategories')

const saveCategories = () => storage.set('categories', JSON.stringify(categories.value))

const addCategory = (isToggle) =>
  prompt(tr.newCategory, tr.typeCategory, '', val => {
    if (categories.value.includes(val)) return errToast(tr.categoryExists)
    categories.value = [...categories.value, val]
    if (isToggle) category.value = val
    saveCategories()
  })

const renameCategory = (_category) => {
  const oldValue = baseCategories.includes(_category) ? tr[_category] : _category

  prompt(tr.renameCategory, tr.typeCategory, oldValue, val => {
    if (oldValue === val) return
    if (categories.value.includes(val)) return errToast(tr.categoryExists)

    const _categories = clone(categories.value)
    const idx = _categories.findIndex(it => it === _category)
    _categories[idx] = val
    categories.value = _categories
    saveCategories()

    const _tasks = tasks.filter(it => it.category === _category)
    for (const task of _tasks) task.category = val
    saveTasks(2)

    if (category.value === _category) category.value = val
  })
}

const deleteCategory = async (_category) => {
  const deleteAllTasksByCategory = (deleteTasks) => {
    if (deleteTasks) {
      const ids = tasks.filter(it => it.category === _category).map(getNumId)
      removeNotifications(ids)

      const _tasks = tasks.filter(it => it.category !== _category)
      setTasks(_tasks)
      saveTasks(1)
      toast(tr.tasksOfCategoryDeleted)
    }

    if (category.value === _category) category.value = 'allCategories'

    const idx = categories.value.findIndex(it => it === _category)
    categories.value.splice(idx, 1)
    saveCategories()
  }

  const categoryTasksSize = tasks.filter(it => it.category === _category).length

  if (categoryTasksSize > 0) {
    if (await confirm(tr.aysToDeleteCategory)) deleteAllTasksByCategory(1)
  } else deleteAllTasksByCategory(0)
}

const onReorder = (ev) => {
  const { from, to } = ev.detail

  const _categories = clone(categories.value)
  arrayMove(_categories, from + 2, to + 2)
  categories.value = _categories

  saveCategories()
  ev.detail.complete()
}

watch(category, (val, old) => {
  if (!val) {
    category.value = old
    addCategory(1)
  } else storage.set('category', val)
})
// #endregion

// #region Main
const setTasks = (arr) => (tasks.length = 0, Object.assign(tasks, arr))

const title = ref(''), addTaskInput = ref()
const listRef = ref()
const taskLength = 50

const current = ref({})
let originalCurrent = {}

const disabledSave = computed(() => isEqual(originalCurrent, current.value))

const saveTasks = (isDel) => {
  tasks.length = tasks.length
  storage.set('tasks', JSON.stringify(tasks))
  selected.value = []

  if (isDel === 2) return
  if (params.sound) new Audio(isDel ? '/trash.mp3' : '/change.wav').play().catch(log)
  if (params.vibro) vibrate(22)
}

const openTask = (task) => {
  originalCurrent = clone(task)
  current.value = clone(task)
  $bus.open('TaskModal')
}

const changeNotification = (task) => {
  const _id = getNumId(task)
  const { notification, completed, priority, category, title } = task
  if (isLater(notification) && !completed) {
    const body = tr.category + ': ' + (baseCategories.includes(category) ? tr[category] : category)
    setNotification(_id, title, body, notification, priority)
  } else removeNotifications([_id])
}

const saveTask = (cur) => {
  cur.title = cur.title.trim()
  if (!cur.title) return errToast(tr.titleIsEmpty)

  const idx = tasks.findIndex(it => it.id === cur.id)
  cur.changed = new Date().toISOString()
  tasks[idx] = cur

  changeNotification(cur)

  toast(tr.taskChanged)
  saveTasks()
  originalCurrent = clone(cur)
  current.value = clone(cur)

  if (params.autoClose) $bus.close('TaskModal')
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

let timer
const cancelTimer = ref(0)

const deleteTask = async (task) => {
  const reset = () => {
    clearInterval(timer)
    cancelTimer.value = 0
  }
  reset()

  const idx = tasks.findIndex(it => it.id === task.id)
  const deleted = tasks[idx]
  tasks.splice(idx, 1)
  let isDeleted = true

  timer = setInterval(() => {
    cancelTimer.value += 0.01
    if (cancelTimer.value > 1) reset()
  }, 30)
  saveTasks(1)

  cancelToast(tr.taskDeleted, () => {
    isDeleted = false
    tasks.splice(idx, 0, deleted)
    reset()
    saveTasks(2)
  })

  await delay(3500)
  if (!isDeleted) return
  const _id = getNumId(deleted)
  removeNotifications([_id])
}

const removeTask = (task) => {
  $bus.close('TaskModal')
  deleteTask(task)
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

const prevTask = () => {
  const idx = filtered.value.findIndex(it => it.id === current.value.id)
  const prev = idx === 0 ? filtered.value.at(-1) : filtered.value[idx - 1]
  originalCurrent = clone(prev)
  current.value = clone(prev)
}

const nextTask = () => {
  const idx = filtered.value.findIndex(it => it.id === current.value.id)
  const next = idx === (filtered.value.length - 1) ? filtered.value[0] : filtered.value[idx + 1]
  originalCurrent = clone(next)
  current.value = clone(next)
}
// #endregion

// #region Selecting
const hasSelected = computed(() => selected.value.length > 0)

const removeNotificationsOfSelected = () => {
  const ids = tasks.filter(it => selected.value.includes(it.id)).map(getNumId)
  removeNotifications(ids)
}

const completeSelected = () => {
  removeNotificationsOfSelected()

  for (const id of selected.value) {
    const task = tasks.find(it => it.id === id)
    task.completed = true
  }
  saveTasks()
  toast(tr.selectedCompleted)
}

const deleteSelected = async () => {
  if (!await confirm(tr.aysToDeleteSelected)) return

  removeNotificationsOfSelected()

  const _tasks = tasks.filter(it => !selected.value.includes(it.id))
  setTasks(_tasks)
  saveTasks(1)
  toast(tr.selectedDeleted)
}

const groupExec = (prop, val) => {
  for (const id of selected.value) {
    const task = tasks.find(it => it.id === id)
    task[prop] = val
    changeNotification(task)
  }
  saveTasks()
}

const changeCategory = () => {
  const options = categories.value.slice(1).map(it => ({ label: baseCategories.includes(it) ? tr[it] : it, value: it }))
  prompt2(tr.selectCategory, options, val => groupExec('category', val))
}

const changePriority = () => {
  const options = priorities.map(it => ({ label: tr[it], value: it, cssClass: `${it}-item` }))
  prompt2(tr.selectPriority, options, val => groupExec('priority', val))
}

const uncompleteSelected = () => groupExec('completed', false)

const changeNotifications = (val) => {
  groupExec('notification', val ?? emptyDatetime)
  $bus.close('NotificationModal')
}
// #endregion

// #region Notification
const checkNotificationPermission = () =>
  LocalNotifications.checkPermissions().then(res => {
    if (res?.display !== 'denied') return
    LocalNotifications.requestPermissions().then(res => {
      if (res?.display === 'denied') errToast(tr.needNotifyPermission)
    })
  })

const setNotification = (id, title, body, dateTime, priority) => {
  const iconColor = getHexColor(priorityType[priority])

  const schedule = { at: new Date(dateTime) }
  const notification = { id, title, body, iconColor, schedule }

  LocalNotifications.schedule({ notifications: [notification] })
}

const removeNotifications = (ids) =>
  LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) })
// #endregion

onMounted(async () => {
  loading.value = true

  filters.value = JSON.parse(await storage.get('filters')) ?? priorities

  categories.value = JSON.parse(await storage.get('categories')) ?? baseCategories
  category.value = await storage.get('category') ?? 'allCategories'

  const _tasks = await storage.get('tasks')
  tasks.push(...(_tasks ? JSON.parse(_tasks) : []))
  loading.value = false

  checkNotificationPermission()
})
</script>

<style scoped lang="sass">
ion-progress-bar
  position: absolute
  bottom: 0
  margin-bottom: 2px
</style>

<style lang="sass">
#main-content > ion-header > ion-item
  --inner-padding-end: 3px

.group-actions > ion-button
  margin: 0

.options-group
  pointer-events: none
  & .alert-checkbox-icon
    display: none
  & .alert-checkbox-label
    padding-left: 26px

.new-category
  color: var(--ion-color-primary)

.alert-message
  white-space: pre-wrap

.shorted-text
  overflow: hidden
  white-space: nowrap
  padding-right: 5px

.full-label > label
  justify-content: space-between
  & > .native-wrapper
    max-width: fit-content

.flex-center
  display: flex
  align-items: center
  justify-content: center
  height: 100%

@each $pr, $color in (low: success, medium: warning, high: danger)
  .#{$pr}-item[aria-checked="true"]
    .alert-checkbox-icon
      border-color: var(--ion-color-#{$color}) !important
      background-color: var(--ion-color-#{$color}) !important
    .alert-radio-icon
      border-color: var(--ion-color-#{$color}) !important
      .alert-radio-inner
        background-color: var(--ion-color-#{$color})
</style>