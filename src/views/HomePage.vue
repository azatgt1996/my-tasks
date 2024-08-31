<template>
  <div> <!-- need only one root node -->
    <Menu :taskLength="tasks.length" @deleteAll="deleteAll" />
    <ion-page id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button />
          </ion-buttons>
          <ion-title style="padding: 0">
            {{ tr.myTasks }}{{ filtered.length ? `: ${filtered.length}` : '' }}
          </ion-title>
          <ion-select slot="end" interface="popover" value="all" style="margin-right: 10px">
            <OptionsGroup :label="tr.categories" />
            <ion-select-option value="all">{{ tr.allCategories }}</ion-select-option>
            <ion-select-option value="private">{{ tr.private }}</ion-select-option>
            <ion-select-option value="work">{{ tr.work }}</ion-select-option>
            <ion-select-option class="new-category" value="">+ {{ tr.newCategory }}</ion-select-option>
          </ion-select>
        </ion-toolbar>
        <ion-item>
          <ion-searchbar v-model="keyword" :placeholder="tr.search" :debounce="500" :maxlength="40"
            show-clear-button="always" :search-icon="params.searchInDesc ? searchCircleOutline : searchSharp"
            style="padding: 5px 8px 5px 0" />
          <ion-select v-show="false" id="filterSelect" v-model="filters" multiple v-bind="selectProps(tr.filters)">
            <OptionsGroup :label="tr.byPriorities" />
            <ion-select-option v-for="pr in priorities" :value="pr" :class="`${pr}-item`">
              {{ tr[pr] }}
            </ion-select-option>
            <OptionsGroup :label="tr.others" />
            <ion-select-option value="completed">{{ tr.completed }}</ion-select-option>
            <ion-select-option value="notificated">{{ tr.notificated }}</ion-select-option>
          </ion-select>
          <ion-icon :icon="funnel" @click="$('#filterSelect').click()"
            :color="filters.length === 3 && isEqual(filters, priorities) ? '' : 'primary'" />
        </ion-item>
        <ion-item>
          <ion-input :placeholder="tr.newTask" v-model="title" :maxlength="40" clear-input
            @keyup.enter="addTask(title)" />
          <ion-icon :icon="addCircle" size="large" color="primary" @click="addTask(title)" />
        </ion-item>
      </ion-header>

      <ion-content>
        <div v-if="loading" class="spinner-container">
          <ion-spinner name="lines" />
        </div>
        <TransitionGroup v-else-if="filtered.length" ref="listRef" name="list" tag="ion-list">
          <ion-item-sliding v-for="task in filtered" :key="task.id">
            <ion-item-options side="start" @ion-swipe="toggleCompleted(task)">
              <ion-item-option color="primary" expandable @click="toggleCompleted(task)">
                <ion-icon slot="icon-only" :icon="task.completed ? arrowUndoCircleOutline : checkmarkCircleOutline" />
              </ion-item-option>
            </ion-item-options>
            <ion-item button @click="openTask(task)">
              <ion-label class="task-title">{{ task.title }}</ion-label>
              <ion-icon v-if="task.completed" :icon="checkmarkCircleOutline" size="small" style="margin-right: 2px" />
              <ion-icon v-if="new Date() < new Date(task.notification)" :icon="alarmOutline" size="small"
                style="margin-right: 2px" />
              <ion-icon :icon="ellipse" size="small" :color="priorityType[task.priority]" />
            </ion-item>
            <ion-item-options side="end" @ion-swipe="deleteTask(task)">
              <ion-item-option color="danger" expandable @click="deleteTask(task)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </TransitionGroup>
        <h1 v-else class="list-status">{{ listStatus }}</h1>

        <ion-modal :is-open="isOpen" @didDismiss="isOpen = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ tr.detailInfo }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="changeTask(current)" :disabled="disabledSave">
                  <ion-icon :icon="saveSharp" />
                </ion-button>
                <ion-button @click="isOpen = false">
                  <ion-icon :icon="closeCircleOutline" />
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <ion-list>
              <ion-item>
                <ion-input :label="tr.created" :value="Date.toLocale(current.created)" readonly class="full-label" />
              </ion-item>
              <ion-item>
                <ion-input :label="tr.changed" :value="Date.toLocale(current.changed)" readonly class="full-label" />
              </ion-item>
              <ion-item>
                <ion-input :label="tr.title" :placeholder="tr.typeTask" v-model="current.title" label-placement="fixed"
                  :maxlength="40" />
              </ion-item>
              <ion-item>
                <ion-textarea :label="tr.description" v-model="current.description" :rows="4"
                  :placeholder="tr.typeDescription" clear-input label-placement="fixed" :maxlength="300" />
              </ion-item>
              <ion-item>
                <ion-label>{{ tr.notification }}</ion-label>
                <ion-datetime-button datetime="datetime" />
                <ion-modal :keep-contents-mounted="true">
                  <ion-datetime id="datetime" hour-cycle="h24" v-model="current.notification" />
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
            </ion-list>
          </ion-content>
          <ion-footer style="display: flex">
            <ion-button size="small" style="width: 100%" fill="clear" @click="prevTask">
              <ion-icon slot="start" :icon="caretBackOutline" />
              {{ tr.prev }}
            </ion-button>
            <ion-button size="small" style="width: 100%" fill="clear" @click="nextTask">
              <ion-icon slot="end" :icon="caretForwardOutline" />
              {{ tr.next }}
            </ion-button>
          </ion-footer>
        </ion-modal>
      </ion-content>
    </ion-page>
  </div>
</template>

<script setup>
import {
  IonMenuButton, IonButton, IonContent, IonHeader, IonIcon, IonInput, IonToolbar, IonModal, IonSearchbar, IonDatetime,
  IonItem, IonLabel, IonList, IonPage, IonTitle, IonButtons, IonDatetimeButton, IonSegment, IonSegmentButton, IonTextarea,
  IonItemSliding, IonItemOptions, IonItemOption, IonSelect, IonSelectOption, useBackButton, useIonRouter, IonFooter, IonSpinner,
} from '@ionic/vue';
import {
  addCircle, ellipse, funnel, trashOutline, arrowUndoCircleOutline, checkmarkCircleOutline,
  alarmOutline, searchCircleOutline, searchSharp, caretBackOutline, caretForwardOutline, saveSharp, closeCircleOutline,
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { computed, onMounted, ref, watch, reactive } from "vue";
import { onClickOutside } from '@vueuse/core';
import { nanoid, customAlphabet } from "nanoid";
import { clone, isEqual, $, delay, log } from "@/utils.js";
import { useGlobalStore } from "@/global.js"
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics } from "@capacitor/haptics";
import { OptionsGroup } from "@/components/renderFunctions.js";
import Menu from "@/components/Menu.vue";

const { tr, params, storage, selectProps, toast, confirm } = useGlobalStore()

// #region Others
const numNanoid = customAlphabet('123456789', 8)
const audio = new Audio('/main.wav')
const audio2 = new Audio('/trash.wav')
const loading = ref(false)

const ionRouter = useIonRouter()
useBackButton(-1, () => {
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

const filtered = computed(() => {
  if (!tasks.length) return []

  const _filter = filters.value
  const _keyword = keyword.value.toLowerCase()
  let result = []

  const onlyAllPriorities = _filter.length === 3 && isEqual(_filter, priorities)
  if (!_keyword.trim() && onlyAllPriorities) result = tasks.filter(it => !it.completed)

  result = tasks.filter(it => {
    let result = it.title.toLowerCase().includes(_keyword)
    if (params.searchInDesc) result ||= it.description.toLowerCase().includes(_keyword)
    result &&= _filter.includes(it.priority)
    if (!_filter.includes('completed')) result &&= !it.completed
    if (_filter.includes('notificated')) result &&= new Date() < new Date(it.notification)
    return result
  })

  return result.sort((t1, t2) => {
    if (params.orderByDesc) [t1, t2] = [t2, t1]
    const sortBy = params.sortBy
    if (sortBy === 'created') return new Date(t1.created) - new Date(t2.created)
    if (sortBy === 'changed') return new Date(t1.changed) - new Date(t2.changed)
    if (sortBy === 'title') return t1.title.localeCompare(t2.title)
    if (sortBy === 'priority') return priorityNum[t1.priority] - priorityNum[t2.priority]
    if (sortBy === 'notification') return new Date(t1.notification) - new Date(t2.notification)
  })
})

const listStatus = computed(() => {
  if (!tasks.length) return tr.emptyList
  if (!filtered.value.length) return tr.tasksNotFound
})
// #endregion

// #region Main
const tasks = reactive([])
const title = ref('')
const isOpen = ref(false)
const listRef = ref()

const current = ref({})
let originalCurrent = {}

const disabledSave = computed(() => isEqual(originalCurrent, current.value))

onClickOutside(listRef, () => listRef.value.$el.closeSlidingItems())

class Task {
  constructor(title, description = '', notification = null) {
    this.id = nanoid()
    this.title = title
    this.created = new Date().toISOString()
    this.changed = new Date().toISOString()
    this.description = description
    this.priority = 'low'
    this.completed = false
    this.notification = notification ?? '2020-01-01T18:00:00.000Z'
  }
}

const saveTasks = (isDel) => {
  storage.set('tasks', JSON.stringify(tasks))
  if (params.sound) (isDel ? audio2 : audio).play().catch(log)
  if (params.vibro) Haptics.vibrate({ duration: 40 })
}

const openTask = (task) => {
  originalCurrent = clone(task)
  current.value = clone(task)
  isOpen.value = true
}

const changeTask = (cur) => {
  cur.title = cur.title.trim()
  if (!cur.title) return toast(tr.titleIsEmpty, 'warning')
  if (tasks.find(it => it.title === cur.title && it.id !== cur.id))
    return toast(tr.taskExists, 'warning')

  const idx = tasks.findIndex(it => it.id === cur.id)
  tasks[idx] = cur
  tasks[idx].changed = new Date().toISOString()

  if (new Date() < new Date(cur.notification)) {
    const color = ({ low: 'green', medium: 'yellow', high: 'red' })[cur.priority]
    scheduleNotification(+numNanoid(), tr.myTasks, cur.notification, cur.title, color)
  }

  toast(tr.taskChanged)
  saveTasks()
  originalCurrent = clone(cur)
  current.value = clone(cur)

  if (params.autoCloseAfterSave) isOpen.value = false
}

const addTask = (_title) => {
  _title = _title.trim()
  if (tasks.find(it => it.title === _title))
    return toast(tr.taskExists, 'warning')
  title.value = ''
  if (!_title) return toast(tr.titleIsEmpty, 'warning')

  const newTask = new Task(_title)
  tasks.push(newTask)
  toast(tr.taskAdded)
  saveTasks()
}

const deleteTask = (task) => {
  const idx = tasks.findIndex(it => it.id === task.id)
  tasks.splice(idx, 1)
  toast(tr.taskDeleted)
  saveTasks(1)
}

const deleteAll = () => {
  confirm(tr.aysToDelete, () => {
    tasks.length = 0
    saveTasks(1)
    toast(tr.allDeleted)
  })
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

// #region Notification
const checkNotificationPermission = () =>
  LocalNotifications.checkPermissions().then(res => {
    if (res?.display !== 'denied') return
    LocalNotifications.requestPermissions().then(res => {
      if (res?.display === 'denied') toast(tr.needNotifyPermission, 'warning')
    })
  })

const scheduleNotification = (id, title, dateTime, body, color) => {
  const notification = { id, title, body, color, schedule: { at: new Date(dateTime) } }
  LocalNotifications.schedule({ notifications: [notification] })
}
// #endregion

onMounted(async () => {
  loading.value = true
  await storage.create()

  filters.value = JSON.parse(await storage.get('filters')) ?? priorities

  const _tasks = await storage.get('tasks')
  tasks.push(...(_tasks ? JSON.parse(_tasks) : []))
  loading.value = false

  checkNotificationPermission()
})
</script>

<style scoped>
ion-searchbar {
  --box-shadow: 0px;
  padding: 0px;
}
</style>

<style>
.options-group {
  pointer-events: none;

  & .alert-checkbox-icon {
    display: none !important;
  }

  & .alert-checkbox-label {
    padding-left: 10px !important;
  }
}

.new-category {
  color: var(--ion-color-primary);
}

.alert-message {
  white-space: pre-wrap;
}

.task-title {
  overflow: hidden;
  white-space: nowrap;
  padding-right: 5px
}

.full-label>label {
  justify-content: space-between;

  &>.native-wrapper {
    max-width: fit-content;
  }
}

.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.list-status {
  height: 100%;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.low-item[aria-checked="true"] .alert-checkbox-icon {
  border-color: var(--ion-color-success) !important;
  background-color: var(--ion-color-success) !important;
}

.medium-item[aria-checked="true"] .alert-checkbox-icon {
  border-color: var(--ion-color-warning) !important;
  background-color: var(--ion-color-warning) !important;
}

.high-item[aria-checked="true"] .alert-checkbox-icon {
  border-color: var(--ion-color-danger) !important;
  background-color: var(--ion-color-danger) !important;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.6s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}
</style>