<template>
  <ion-menu content-id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ tr.MENU }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <IconText :icon="mailOutline" :text="tr.CONTACT_US" @click="contactUs" />
        <IconText :icon="trashOutline" :text="tr.DELETE_ALL" @click="deleteAll" />
        <IconText :icon="shareSocialOutline" :text="tr.SHARE" @click="shareApp" />
        <IconText :icon="starOutline" :text="tr.RATE_APP" @click="rateApp" />
        <IconText :icon="informationCircleOutline" :text="tr.ABOUT" @click="showAppInfo" />
        <IconText :icon="settingsOutline" :text="tr.SETTINGS" />
        <IconText :icon="powerOutline" :text="tr.EXIT" @click="App.exitApp()" />
      </ion-list>
    </ion-content>
  </ion-menu>

  <ion-page id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title style="padding: 0">
          {{ tr.MY_TASKS }}{{ filtered.length ? `: ${filtered.length}` : '' }}
        </ion-title>
        <img slot="end" :src="getFlagImg(lang)" :alt="lang" width="30" @click="$('#langSelect').click()"
          style="margin-right: 8px" />
        <ion-select v-show="false" v-model="lang" id="langSelect" v-bind="selectParams(tr.SELECT_LANG)">
          <ion-select-option v-for="lang of langs" :value="lang.value">
            {{ lang.label }}
          </ion-select-option>
        </ion-select>
        <ion-icon :icon="isDarkMode ? moon : sunny" slot="end" size="large" @click="toggleDarkMode"
          style="margin-right: 8px" />
      </ion-toolbar>
      <ion-item>
        <ion-searchbar v-model="keyword" :placeholder="tr.SEARCH" :debounce="500" maxlength="40"
          show-clear-button="always" style="padding: 5px 8px 5px 0" />
        <ion-select v-show="false" id="fSelect" v-model="filter" multiple v-bind="selectParams(tr.filter)">
          <OptionsGroup :label="tr.byPriorities" />
          <ion-select-option value="low">{{ tr.low }}</ion-select-option>
          <ion-select-option value="medium">{{ tr.medium }}</ion-select-option>
          <ion-select-option value="high">{{ tr.high }}</ion-select-option>
          <OptionsGroup :label="tr.others" />
          <ion-select-option value="archived">{{ tr.archived }}</ion-select-option>
          <ion-select-option value="notificated">{{ tr.notificated }}</ion-select-option>
        </ion-select>
        <ion-icon :icon="funnel" @click="$('#fSelect').click()"
          :color="filter.length === 3 && isEqual(filter, Object.keys(priorityType)) ? '' : 'primary'" />
      </ion-item>
      <ion-item>
        <ion-input :placeholder="tr.NEW_TASK" v-model="title" maxlength="30" clear-input
          @keyup.enter="addTask(title)" />
        <ion-icon :icon="addCircle" size="large" color="primary" @click="addTask(title)" />
      </ion-item>
    </ion-header>

    <ion-content>
      <ion-list ref="listRef" v-if="filtered.length">
        <ion-item-sliding v-for="task in filtered" :key="task.id">
          <ion-item-options side="start" @ion-swipe="toggleArchived(task)">
            <ion-item-option color="success" expandable>
              <ion-icon slot="icon-only" :icon="task.archived ? arrowUpCircleOutline : arrowDownCircleOutline"
                @click="toggleArchived(task)" />
            </ion-item-option>
          </ion-item-options>
          <ion-item button @click="openTask(task)">
            <ion-label>{{ task.title }}</ion-label>
            <ion-icon :icon="ellipse" size="small" :color="priorityType[task.priority]" />
          </ion-item>
          <ion-item-options side="end" @ion-swipe="removeTask(task)">
            <ion-item-option color="danger" expandable>
              <ion-icon slot="icon-only" :icon="trashOutline" @click="removeTask(task)" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      <h1 v-else class="ion-text-center">{{ listTitle }}</h1>

      <ion-modal :is-open="isOpen" @didDismiss="isOpen = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ tr.DETAIL_INFO }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="changeTask(current)">
                <ion-icon :icon="checkmark" color="success" />
              </ion-button>
              <ion-button @click="isOpen = false">
                <ion-icon :icon="close" color="primary" />
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            <ion-item>
              <ion-input :label="tr.CREATED" v-model="current.created" readonly />
            </ion-item>
            <ion-item>
              <ion-input :label="tr.CHANGED" v-model="current.changed" readonly />
            </ion-item>
            <ion-item>
              <ion-input :label="tr.TITLE" :placeholder="tr.TYPE_TASK" v-model="current.title" />
            </ion-item>
            <ion-item>
              <ion-textarea :label="tr.DESCRIPTION" v-model="current.description" :rows="4"
                :placeholder="tr.TYPE_DESCRIPTION" clear-input />
            </ion-item>
            <ion-item>
              <ion-label style="margin-right: 10px">{{ tr.PRIORITY }}</ion-label>
              <ion-segment v-model="current.priority" mode="ios">
                <ion-segment-button v-for="key in Object.keys(priorityType)" :value="key">
                  <ion-label :color="priorityType[key]">{{ tr[key] }}</ion-label>
                </ion-segment-button>
              </ion-segment>
            </ion-item>
            <ion-item>
              <ion-label>{{ tr.NOTIFICATION }}</ion-label>
              <ion-datetime-button datetime="datetime" />
              <ion-modal :keep-contents-mounted="true">
                <ion-datetime id="datetime" hour-cycle="h24" v-model="current.notification" />
              </ion-modal>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonMenuButton, IonMenu,
  IonButton, IonContent, IonHeader, IonIcon, IonInput, IonToolbar, IonModal, IonSearchbar, IonDatetime,
  IonItem, IonLabel, IonList, IonPage, IonTitle, IonButtons, IonDatetimeButton,
  IonSegment, IonSegmentButton, IonTextarea, IonItemSliding, IonItemOptions, IonItemOption,
  IonSelect, IonSelectOption, useBackButton, useIonRouter,
} from '@ionic/vue';
import {
  addCircle, checkmark, close, ellipse, funnel, sunny, moon, mailOutline,
  arrowDownCircleOutline, arrowUpCircleOutline, powerOutline,
  informationCircleOutline, settingsOutline, starOutline, shareSocialOutline, trashOutline,
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { Storage } from "@ionic/storage";
import { computed, onMounted, reactive, ref, watch, h } from "vue";
import { onClickOutside } from '@vueuse/core';
import { Translations, langs } from "@/translations.js";
import { nanoid, customAlphabet } from "nanoid";
import { toast, confirm, alert, clone, isEqual, $ } from "@/utils.js";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';

const getFlagImg = (name) => new URL(`../assets/flags/${name}.png`, import.meta.url).href

const numNanoid = customAlphabet('123456789', 8)

const IconText = ({ text, icon }) =>
  h(IonItem, { button: true }, () => [
    h(IonIcon, { icon, style: 'margin-right: 10px' }), h(IonLabel, () => text)
  ])

const OptionsGroup = ({ label }) =>
  h(IonSelectOption, { disabled: true, class: 'options-group' }, () => label)

const selectParams = (label) => ({ cancelText: tr.CANCEL, interfaceOptions: { header: label } })

// #region X// #endregion

// #region Menu
const contactLink = 'mailto:azatgt96@gmail.com?subject=My%20Tasks%20Support&body='
const appLink = 'https://play.google.com/store/apps/details?id=com.kvarta.memorytraining'

const contactUs = () => window.location.href = contactLink

const shareApp = () => Share.share({
  title: 'Some title', text: 'Some text',
  dialogTitle: 'Some dialogTitle', url: appLink
})

const rateApp = () => window.location.href = appLink

const showAppInfo = () => alert('Some text', 'App info')

const deleteAll = () => confirm('Are you sure?', () => toast('yes'))

// #endregion

// #region Others
const storage = new Storage()
const ionRouter = useIonRouter()
useBackButton(-1, () => {
  if (!ionRouter.canGoBack()) App.exitApp()
})

const lang = ref()
const tr = reactive({})
watch(lang, async (val) => {
  await storage.set('lang', val)
  Object.assign(tr, Translations[val])
})
// #endregion

// #region Filter
const priorityType = { low: 'success', medium: 'warning', high: 'danger' }
const keyword = ref('')
const filter = ref(Object.keys(priorityType))

const filtered = computed(() => {
  const _filter = filter.value
  const onlyAllPriorities = _filter.length === 3 && isEqual(_filter, Object.keys(priorityType))
  if (!keyword.value.trim() && onlyAllPriorities) return tasks.value.filter(it => !it.archived)

  return tasks.value.filter(it => {
    let result = it.title.toLowerCase().includes(keyword.value.toLowerCase())
    result &&= _filter.includes(it.priority)
    if (!_filter.includes('archived')) result &&= !it.archived
    if (_filter.includes('notificated')) result &&= new Date() < new Date(it.notification)
    return result
  })
})

const listTitle = computed(() => {
  if (!tasks.value.length) return tr.EMPTY_LIST
  if (!filtered.value.length) return tr.TASKS_NOT_FOUND
})
// #endregion

// #region Main
const tasks = ref([])
const title = ref('')
const current = ref({})
const isOpen = ref(false)
const listRef = ref()

onClickOutside(listRef, () => listRef.value.$el.closeSlidingItems())

class Task {
  constructor(title, description = '', notification = null) {
    this.id = nanoid()
    this.title = title
    this.created = new Date().toLocaleString()
    this.changed = new Date().toLocaleString()
    this.description = description
    this.priority = 'low'
    this.archived = false
    this.notification = notification ?? '2020-01-01T18:00:00'
  }
}

const saveTasks = async () => {
  const storedTasks = JSON.stringify(tasks.value)
  await storage.set('storedTasks', storedTasks)

  listRef.value.$el.closeSlidingItems()
}

const openTask = (task) => {
  current.value = clone(task)
  isOpen.value = true
}

const changeTask = (cur) => {
  cur.title = cur.title.trim()
  if (!cur.title) return toast(tr.TITLE_NOT_VALID, 'warning')
  if (tasks.value.find(it => it.title === cur.title && it.id !== cur.id))
    return toast(tr.TASK_EXISTS, 'warning')
  const idx = tasks.value.findIndex(it => it.id === cur.id)
  if (!isEqual(cur, tasks.value[idx])) {
    tasks.value[idx] = cur
    tasks.value[idx].changed = new Date().toLocaleString()
    if (new Date() < new Date(cur.notification))
      scheduleNotification(+numNanoid(), 'My Tasks', cur.notification, cur.title)

    toast(tr.TASK_CHANGED)
    saveTasks()
  }

  isOpen.value = false
}

const addTask = (_title) => {
  _title = _title.trim()
  if (tasks.value.find(it => it.title === _title))
    return toast(tr.TASK_EXISTS, 'warning')
  title.value = ''
  if (!_title) return toast(tr.TITLE_NOT_VALID, 'warning')

  const newTask = new Task(_title)
  tasks.value.push(newTask)
  toast(tr.TASK_ADDED)
  saveTasks()
}

const removeTask = (task) => {
  const idx = tasks.value.findIndex(it => it.id === task.id)
  tasks.value.splice(idx, 1)
  toast(tr.TASK_DELETED)
  saveTasks()
}

const toggleArchived = (task) => {
  const idx = tasks.value.findIndex(it => it.id === task.id)
  const isArchived = !task.archived
  tasks.value[idx].archived = isArchived

  saveTasks()
  toast(isArchived ? tr.TASK_ARCHIVED : tr.TASK_UNARCHIVED)
}

// #endregion

// #region Notification
const checkNotificationPermission = () =>
  LocalNotifications.checkPermissions().then(res => {
    if (res?.display !== 'denied') return
    LocalNotifications.requestPermissions().then(res => {
      if (res?.display === 'denied') toast(tr.NEED_NOTIF_PERMISSION, 'warning')
    })
  })

const scheduleNotification = (id, title, dateTime, body) => {
  const notification = { id, title, body, schedule: { at: new Date(dateTime) } }
  LocalNotifications.schedule({ notifications: [notification] })
}
// #endregion

// #region Dark mode
const isDarkMode = ref(false)

const toggleDarkMode = async () => {
  isDarkMode.value = !isDarkMode.value
  await storage.set('darkMode', isDarkMode.value)
  document.documentElement.classList.toggle('ion-palette-dark', isDarkMode.value)
}
// #endregion

onMounted(async () => {
  await storage.create()
  const storedTasks = await storage.get('storedTasks')
  tasks.value = storedTasks ? JSON.parse(await storage.get('storedTasks')) : []

  isDarkMode.value = await storage.get('darkMode')
  document.documentElement.classList.toggle('ion-palette-dark', isDarkMode.value)

  lang.value = (await storage.get('lang')) ?? Object.keys(Translations)[0]

  checkNotificationPermission()
})

</script>

<style>
.options-group .alert-checkbox-icon {
  display: none !important;
}

.options-group .alert-checkbox-label {
  padding-left: 10px !important;
}
</style>