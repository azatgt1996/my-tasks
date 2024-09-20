<template>
  <div> <!-- need only one root node -->
    <Menu :tasksLength="tasks.length" :completedTasksLength="tasks.filter(it => it.completed).length"
      @deleteAll="deleteAll" @deleteAllCompleted="deleteAllCompleted" @openCategories="openCategories" />
    <ion-page id="main-content">
      <ion-header>
        <ion-toolbar v-show="!selected.length">
          <ion-buttons slot="start">
            <ion-menu-button />
          </ion-buttons>
          <ion-title style="padding: 0">
            {{ tr.myTasks }}{{ filtered.length ? `: ${filtered.length}` : '' }}
          </ion-title>
          <UiSelect :key="categorySelectKey" slot="end" interface="popover" v-model="category"
            style="margin-right: 10px">
            <ion-select-option v-for="_category in categories" :value="_category">
              {{ baseCategories.includes(_category) ? tr[_category] : _category }}
            </ion-select-option>
            <ion-select-option class="new-category" value="">+ {{ tr.newCategory }}</ion-select-option>
          </UiSelect>
        </ion-toolbar>
        <ion-toolbar v-show="selected.length">
          <ion-title>{{ tr.selected }}: {{ selected.length }}</ion-title>
          <IconBtn slot="end" color="primary" :icon="checkmarkCircleOutline" @click="completeSelected" />
          <IconBtn slot="end" color="danger" :icon="trashOutline" @click="deleteSelected" />
          <IconBtn slot="end" :color="selected.length == filtered.length ? 'success' : 'medium'"
            :icon="checkmarkDoneCircle" @click="selectAll" style="margin: 0 14px" />
        </ion-toolbar>

        <ion-item lines="none">
          <ion-input :placeholder="tr.search" v-model="keyword" :maxlength="taskLength" clear-input :debounce="500"
            :disabled>
            <ion-icon slot="start" size="small" :icon="params.searchInDesc ? searchCircleOutline : searchSharp" />
            <IconBtn slot="end" size="small" :icon="funnel" @click="$('#filterSelect').click()" :disabled
              :color="filters.length === 3 && isEqual(filters, priorities) ? 'medium' : 'primary'" />
          </ion-input>
          <UiSelect v-show="false" id="filterSelect" v-model="filters" multiple :header="tr.filters">
            <OptionsGroup :label="tr.byPriorities" />
            <ion-select-option v-for="pr in priorities" :value="pr" :class="`${pr}-item`">
              {{ tr[pr] }}
            </ion-select-option>
            <OptionsGroup :label="tr.others" />
            <ion-select-option value="completed">{{ tr.completed }}</ion-select-option>
            <ion-select-option value="notificated">{{ tr.notificated }}</ion-select-option>
          </UiSelect>
        </ion-item>
        <ion-item lines="none">
          <ion-input :placeholder="tr.newTask" v-model="title" :maxlength="taskLength" clear-input
            @keyup.enter="addTask(title)" :disabled>
            <IconBtn slot="end" size="small" :icon="addCircle" :color="!title?.trim() ? 'secondary' : 'primary'"
              @click="addTask(title)" :disabled />
          </ion-input>
        </ion-item>
      </ion-header>

      <ion-content>
        <div v-show="loading" class="spinner-container">
          <ion-spinner name="lines" />
        </div>
        <TransitionGroup v-show="filtered.length" ref="listRef" name="list" tag="ion-list">
          <ion-item-sliding v-for="task in filtered" :key="task.id" :disabled @ionDrag="onIonDrag">
            <ion-item-options side="start" @ion-swipe="toggleCompleted(task)">
              <ion-item-option color="primary" expandable @click="toggleCompleted(task)">
                <ion-icon slot="icon-only" :icon="task.completed ? arrowUndoCircleOutline : checkmarkCircleOutline" />
              </ion-item-option>
            </ion-item-options>
            <ion-item button @click="clickTask(task)" @touchstart="checkTask(task)" @touchend="clearTimer2">
              <ion-icon v-show="selected.includes(task.id)" :icon="checkmarkOutline" color="success"
                style="margin-right: 5px" class="check-icon" />
              <ion-label class="task-title" :class="{ 'striked-text': task.completed }">
                {{ task.title }}
              </ion-label>
              <ion-icon v-if="task.completed" :icon="checkmarkCircleOutline" size="small" style="margin-right: 2px" />
              <ion-icon v-if="new Date() < new Date(task.notification == emptyDatetime ? 0 : task.notification)"
                :icon="alarmOutline" size="small" style="margin-right: 2px" />
              <ion-icon :icon="ellipse" size="small" :color="priorityType[task.priority]" />
            </ion-item>
            <ion-item-options side="end" @ion-swipe="deleteTask(task)">
              <ion-item-option color="danger" expandable @click="deleteTask(task)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </TransitionGroup>
        <ion-label v-show="!filtered.length" class="list-status" color="medium">{{ listStatus }}</ion-label>

        <ion-modal :is-open="taskModal" @didDismiss="taskModal = false">
          <ion-header>
            <ion-toolbar class="icon-modal">
              <ion-icon slot="start" :icon="readerOutline" />
              <ion-title>{{ tr.detailInfo }}</ion-title>
              <ion-buttons slot="end">
                <IconBtn :icon="saveSharp" :disabled="disabledSave" @click="changeTask(current)" />
                <IconBtn :icon="closeCircleOutline" @click="taskModal = false" />
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content id="task-modal">
            <ion-list>
              <ion-item>
                <ion-input :label="tr.created" :value="localeDate(current.created)" readonly class="full-label" />
              </ion-item>
              <ion-item>
                <ion-input :label="tr.changed" :value="localeDate(current.changed)" readonly class="full-label" />
              </ion-item>
              <ion-item>
                <ion-input :label="tr.title" :placeholder="tr.typeTask" v-model="current.title" label-placement="fixed"
                  :maxlength="taskLength" />
              </ion-item>
              <ion-item>
                <ion-textarea :label="tr.description" v-model="current.description" :rows="4"
                  :placeholder="tr.typeDescription" clear-input label-placement="fixed" :maxlength="300" />
              </ion-item>
              <ion-item>
                <UiSelect v-model="current.category" :label="tr.category" :header="tr.selectCategory">
                  <ion-select-option v-for="_category in categories.slice(1)" :value="_category">
                    {{ baseCategories.includes(_category) ? tr[_category] : _category }}
                  </ion-select-option>
                </UiSelect>
              </ion-item>
              <ion-item>
                <ion-label>{{ tr.notification }}</ion-label>
                <ion-button v-if="current.notification === emptyDatetime" color="light" @click="setAlarm">
                  <ion-icon :icon="addOutline" />
                  <ion-icon :icon="alarmOutline" size="small" />
                </ion-button>
                <ion-datetime-button v-else datetime="datetime" />
                <ion-modal :keep-contents-mounted="true">
                  <ion-datetime id="datetime" :locale="tr._code" hour-cycle="h23" :min="minDate"
                    v-model="current.notification" />
                </ion-modal>
              </ion-item>
              <ion-item>
                <ion-label style="margin-right: 10px">{{ tr.priority }}</ion-label>
                <ion-segment v-model="current.priority" mode="ios">
                  <ion-segment-button v-for="value in priorities" :value="value">
                    <ion-label :color="priorityType[value]">{{ tr[value] }}</ion-label>
                  </ion-segment-button>
                </ion-segment>
              </ion-item>
              <ion-item>
                <ion-checkbox v-model="current.completed" justify="space-between"
                  :style="current.completed ? 'color: var(--ion-color-primary)' : ''">
                  {{ tr.isCompleted }}
                </ion-checkbox>
              </ion-item>
              <ion-item button @click="removeTask(current)">
                <ion-icon :icon="trashOutline" color="danger" style="margin-right: 10px" />
                <ion-label color="danger">{{ tr.delete }}</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
          <ion-footer v-show="filtered.length > 1" style="display: flex">
            <ion-button size="small" style="width: 100%" fill="clear" @click="prevTask"
              :disabled="filtered[0]?.id == current.id">
              <ion-icon slot="start" :icon="caretBackOutline" />
              {{ tr.prev }}
            </ion-button>
            <ion-button size="small" style="width: 100%" fill="clear" @click="nextTask"
              :disabled="filtered.at(-1)?.id == current.id">
              <ion-icon slot="end" :icon="caretForwardOutline" />
              {{ tr.next }}
            </ion-button>
          </ion-footer>
        </ion-modal>

        <ion-modal :is-open="categoriesModal" @didDismiss="categoriesModal = false">
          <ion-header>
            <ion-toolbar class="icon-modal">
              <ion-icon slot="start" :icon="albumsOutline" />
              <ion-title>{{ tr.categories }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="addCategory()">{{ tr.add }}</ion-button>
                <IconBtn :icon="closeCircleOutline" @click="categoriesModal = false" />
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <ion-list>
              <ion-item>
                <ion-label>
                  <ion-note style="margin-right: 6px">
                    ({{ tasks.filter(it => it.category === 'common').length }})
                  </ion-note>
                  {{ tr.common }}
                </ion-label>
              </ion-item>
              <ion-reorder-group :disabled="false" @ionItemReorder="onReorder">
                <ion-item v-for="_category in categories.slice(2)" :key="_category">
                  <ion-label style="margin-right: 10px">
                    <ion-note style="margin-right: 6px">
                      ({{ tasks.filter(it => it.category === _category).length }})
                    </ion-note>
                    {{ baseCategories.includes(_category) ? tr[_category] : _category }}
                  </ion-label>
                  <IconBtn color="primary" size="small" :icon="pencilOutline" @click="renameCategory(_category)" />
                  <IconBtn color="danger" size="small" :icon="trashOutline" @click="deleteCategory(_category)" />
                  <ion-reorder slot="end" :style="categories.slice(2).length === 1 ? 'pointer-events: none' : ''" />
                </ion-item>
              </ion-reorder-group>
            </ion-list>
          </ion-content>
        </ion-modal>
      </ion-content>
      <ion-progress-bar v-show="cancelTimer" :value="cancelTimer" color="secondary" />
    </ion-page>
  </div>
</template>

<script setup>
import {
  useBackButton, useIonRouter, IonMenuButton, IonButton, IonContent, IonHeader, IonIcon, IonInput,
  IonToolbar, IonModal, IonSearchbar, IonDatetime, IonReorderGroup, IonReorder, IonCheckbox, IonProgressBar, IonNote,
  IonItem, IonLabel, IonList, IonPage, IonTitle, IonButtons, IonDatetimeButton, IonSegment, IonSegmentButton, IonTextarea,
  IonItemSliding, IonItemOptions, IonItemOption, IonSelectOption, IonFooter, IonSpinner,
} from '@ionic/vue';
import {
  addCircle, ellipse, funnel, trashOutline, arrowUndoCircleOutline, checkmarkCircleOutline, addOutline, readerOutline,
  alarmOutline, searchCircleOutline, searchSharp, caretBackOutline, caretForwardOutline, saveSharp, closeCircleOutline,
  albumsOutline, pencilOutline, checkmarkOutline, checkmarkDoneCircle,
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { computed, onMounted, ref, watch, reactive } from "vue";
import { onClickOutside } from '@vueuse/core';
import { nanoid, customAlphabet } from "nanoid";
import { clone, isEqual, $, delay, log, arrayMove } from "@/utils.js";
import { useGlobalStore } from "@/global.js";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics } from "@capacitor/haptics";
import { OptionsGroup, IconBtn } from "@/components/renderFunctions.js";
import UiSelect from "@/components/UiSelect.vue";
import Menu from "@/components/Menu.vue";

const { tr, params, storage, localeDate, toast, errToast, cancelToast, confirm, prompt } = useGlobalStore()

// #region Others
const numNanoid = customAlphabet('123456789', 8)
const audio = new Audio('/change.wav')
const audio2 = new Audio('/trash.mp3')
const loading = ref(false)

const ionRouter = useIonRouter()
useBackButton(-1, () => {
  if (selected.value.length) return selected.value = []
  if (!ionRouter.canGoBack()) App.exitApp()
})
// #endregion

// #region Filter
const priorityType = { low: 'success', medium: 'warning', high: 'danger' }
const priorities = Object.keys(priorityType)
const keyword = ref('')
const filters = ref([])
const priorityNum = { low: 0, medium: 1, high: 2 }

watch(filters, (val) => storage.set('filters', JSON.stringify(val)))

const grouped = computed(() => { // grouped by category
  if (category.value == 'allCategories') return tasks
  return tasks.filter(it => it.category == category.value)
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
    if (_filter.includes('notificated')) res &&= new Date() < new Date(it.notification == emptyDatetime ? 0 : it.notification)
    return res
  })

  return result.sort((t1, t2) => {
    if (orderByDesc) [t1, t2] = [t2, t1]
    if (sortBy === 'created') return new Date(t1.created) - new Date(t2.created)
    if (sortBy === 'changed') return new Date(t1.changed) - new Date(t2.changed)
    if (sortBy === 'title') return t1.title.localeCompare(t2.title)
    if (sortBy === 'priority') return priorityNum[t1.priority] - priorityNum[t2.priority]
    if (sortBy === 'notification')
      return new Date(t1.notification == emptyDatetime ? 0 : t1.notification) - new Date(t2.notification == emptyDatetime ? 0 : t2.notification)
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
const categorySelectKey = ref(0)
const categoriesModal = ref(false)

const openCategories = () => categoriesModal.value = true

const saveCategories = () => storage.set('categories', JSON.stringify(categories.value))

const addCategory = (isToggle) =>
  prompt(tr.newCategory, '', tr.typeCategory, '', (val) => {
    if (categories.value.includes(val)) return errToast(tr.categoryExists)
    categories.value = [...categories.value, val]
    if (isToggle) category.value = val
    saveCategories()
  })

const renameCategory = (_category) => {
  const oldValue = baseCategories.includes(_category) ? tr[_category] : _category

  prompt(tr.renameCategory, '', tr.typeCategory, oldValue, (val) => {
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
      const _tasks = tasks.filter(it => it.category !== _category)
      tasks.length = 0
      Object.assign(tasks, _tasks)
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

watch(tr, () => categorySelectKey.value++)
// #endregion

// #region Main
const tasks = reactive([])
const title = ref('')
const taskModal = ref(false)
const listRef = ref()
const taskLength = 50
const emptyDatetime = '2100-01-01T00:00:00.000Z'
const minDate = ref(null)

const current = ref({})
let originalCurrent = {}

watch(current, () => {
  minDate.value = getLocaleDate().toISOString()
})

const disabledSave = computed(() => isEqual(originalCurrent, current.value))

onClickOutside(listRef, () => listRef.value.$el.closeSlidingItems())

const saveTasks = (isDel) => {
  tasks.length = tasks.length
  storage.set('tasks', JSON.stringify(tasks))

  if (isDel == 2) return
  if (params.sound) (isDel ? audio2 : audio).play().catch(log)
  if (params.vibro) Haptics.vibrate({ duration: 28 })
}

const openTask = async (task) => {
  originalCurrent = clone(task)
  current.value = clone(task)
  taskModal.value = true

  await delay(200)
  $('#task-modal').addEventListener('swiped-left', () => filtered.value.at(-1)?.id !== current.value.id && nextTask())
  $('#task-modal').addEventListener('swiped-right', () => filtered.value[0]?.id !== current.value.id && prevTask())
}

const changeTask = (cur) => {
  cur.title = cur.title.trim()
  if (!cur.title) return errToast(tr.titleIsEmpty)
  if (tasks.find(it => it.title === cur.title && it.id !== cur.id))
    return errToast(tr.taskExists)

  const idx = tasks.findIndex(it => it.id === cur.id)
  cur.changed = new Date().toISOString()
  tasks[idx] = cur

  if (new Date() < new Date(cur.notification) && cur.notification !== emptyDatetime) {
    const color = ({ low: 'green', medium: 'yellow', high: 'red' })[cur.priority]
    scheduleNotification(+numNanoid(), tr.myTasks, cur.notification, cur.title, color)
  }

  toast(tr.taskChanged)
  saveTasks()
  originalCurrent = clone(cur)
  current.value = clone(cur)

  if (params.autoClose) taskModal.value = false
}

const addTask = (_title) => {
  _title = _title.trim()
  if (tasks.find(it => it.title === _title)) return errToast(tr.taskExists)
  title.value = ''
  if (!_title) return errToast(tr.titleIsEmpty)

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

const deleteTask = (task) => {
  const reset = () => {
    clearInterval(timer)
    cancelTimer.value = 0
  }
  reset()

  const idx = tasks.findIndex(it => it.id === task.id)
  const deleted = tasks[idx]
  tasks.splice(idx, 1)

  timer = setInterval(() => {
    cancelTimer.value += 0.01
    if (cancelTimer.value > 1) reset()
  }, 30)
  saveTasks(1)

  cancelToast(tr.taskDeleted, () => {
    tasks.splice(idx, 0, deleted)
    reset()
    saveTasks(2)
  })
}

const removeTask = (task) => {
  taskModal.value = false
  deleteTask(task)
}

const deleteAll = async () => {
  if (!await confirm(tr.aysToDelete)) return
  tasks.length = 0
  saveTasks(1)
  toast(tr.allDeleted)
}

const deleteAllCompleted = async () => {
  if (!await confirm(tr.aysToDeleteAllCompleted)) return
  const uncompletedTasks = tasks.filter(it => !it.completed)
  tasks.length = 0
  Object.assign(tasks, uncompletedTasks)
  saveTasks(1)
  toast(tr.allCompletedDeleted)
}

const getLocaleDate = () => {
  const tzo = new Date().getTimezoneOffset() * 60000
  return new Date(new Date() - tzo)
}

const setAlarm = () => {
  const now = getLocaleDate()
  const next = new Date(now.setTime(now.getTime() + 3_600_000))
  current.value.notification = new Date(next).toISOString()
}

const toggleCompleted = async (task) => {
  const idx = tasks.findIndex(it => it.id === task.id)
  listRef.value?.$el.closeSlidingItems()
  await delay(200)
  const isCompleted = !task.completed
  tasks[idx].completed = isCompleted
  tasks[idx].changed = new Date().toISOString()

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
const selected = ref([])
const disabled = computed(() => selected.value.length > 0)
let timer2, notOpen = false, _sliding = false

const select = (task) => {
  if (selected.value.includes(task.id))
    selected.value = selected.value.filter(id => id !== task.id)
  else {
    selected.value.push(task.id)
    if (params.vibro) Haptics.vibrate({ duration: 18 })
  }
}

const clickTask = async (task) => {
  if (selected.value.length) {
    select(task)
    return notOpen = false
  }

  if (notOpen) return notOpen = false
  openTask(task)
}

const clearTimer2 = () => {
  clearTimeout(timer2)
  _sliding = false
}

const completeSelected = () => {
  for (const id of selected.value) {
    const task = tasks.find(it => it.id === id)
    task.completed = true
  }
  saveTasks()
  toast(tr.selectedCompleted)
  selected.value = []
}

const deleteSelected = async () => {
  if (!await confirm(tr.aysToDeleteSelected)) return
  const _tasks = tasks.filter(it => !selected.value.includes(it.id))
  tasks.length = 0
  Object.assign(tasks, _tasks)
  saveTasks(1)
  toast(tr.selectedDeleted)
  selected.value = []
}

const selectAll = () => {
  if (filtered.value.length == selected.value.length) selected.value = []
  else selected.value = filtered.value.map(task => task.id)
}

const onIonDrag = () => _sliding = true

const checkTask = (task) => timer2 = setTimeout(() => {
  if (_sliding) return
  select(task)
  notOpen = true
}, 700)
// #endregion

// #region Notification
const checkNotificationPermission = () =>
  LocalNotifications.checkPermissions().then(res => {
    if (res?.display !== 'denied') return
    LocalNotifications.requestPermissions().then(res => {
      if (res?.display === 'denied') errToast(tr.needNotifyPermission)
    })
  })

const scheduleNotification = (id, title, dateTime, body, color) => {
  const notification = { id, title, body, color, schedule: { at: new Date(dateTime) } }
  LocalNotifications.schedule({ notifications: [notification] })
}
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
.check-icon
  --ionicon-stroke-width: 80px

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

.task-title
  overflow: hidden
  white-space: nowrap
  padding-right: 5px

.full-label > label
  justify-content: space-between
  & > .native-wrapper
    max-width: fit-content

.spinner-container
  display: flex
  align-items: center
  justify-content: center
  height: 100%

.list-status
  height: 100%
  margin: 0
  display: flex
  justify-content: center
  align-items: center
  font-size: x-large

.low-item[aria-checked="true"] .alert-checkbox-icon
  border-color: var(--ion-color-success) !important
  background-color: var(--ion-color-success) !important

.medium-item[aria-checked="true"] .alert-checkbox-icon
  border-color: var(--ion-color-warning) !important
  background-color: var(--ion-color-warning) !important

.high-item[aria-checked="true"] .alert-checkbox-icon
  border-color: var(--ion-color-danger) !important
  background-color: var(--ion-color-danger) !important

.list-enter-active, .list-leave-active
  transition: all 0.4s ease

.list-enter-from, .list-leave-to
  opacity: 0
</style>