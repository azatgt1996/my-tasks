<template>
  <ion-menu content-id="main-content" ref="menuRef">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ tr.menu }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list @click="menuRef.$el.close()">
        <IconText :icon="mailOutline" :text="tr.contactUs" @click="contactUs" />
        <IconText :icon="trashOutline" :text="tr.deleteAll" @click="deleteAll" />
        <IconText :icon="shareSocialOutline" :text="tr.share" @click="shareApp" />
        <IconText :icon="starOutline" :text="tr.rateApp" @click="rateApp" />
        <IconText :icon="informationCircleOutline" :text="tr.aboutApp" @click="showAppInfo" />
        <IconText :icon="settingsOutline" :text="tr.settings" @click="isOpen2 = true" />
        <IconText :icon="powerOutline" :text="tr.exit" @click="App.exitApp()" />
      </ion-list>
    </ion-content>
  </ion-menu>

  <ion-modal :is-open="isOpen2" @didDismiss="isOpen2 = false">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ tr.settings }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="isOpen2 = false">
            <ion-icon :icon="close" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item>
          <ion-icon :icon="radioOutline" style="margin-right: 7px" />
          <ui-toggle :label="tr.vibro" v-model="params.vibro" />
        </ion-item>
        <ion-item>
          <ion-icon :icon="musicalNoteOutline" style="margin-right: 7px" />
          <ui-toggle :label="tr.sound" v-model="params.sound" />
        </ion-item>
        <ion-item>
          <ion-icon :icon="searchCircleOutline" style="margin-right: 7px" />
          <ui-toggle :label="tr.searchInDescription" v-model="params.searchInDesc" />
        </ion-item>
        <ion-item>
          <ion-icon :icon="filterSharp" style="margin-right: 7px" />
          <ion-select :label="tr.sortBy" v-model="params.sortBy" v-bind="selectParams(tr.sortBy)">
            <ion-select-option v-for="val in sorts" :value="val">{{ tr[val] }}</ion-select-option>
          </ion-select>
        </ion-item>
        <!-- <ion-item button @click="exportToPdf">
          <ion-icon :icon="documentTextOutline" style="margin-right: 7px" />
          <ion-label>{{ tr.exportToPdf }}</ion-label>
        </ion-item> -->
      </ion-list>
    </ion-content>
  </ion-modal>

  <ion-page id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button />
        </ion-buttons>
        <ion-title style="padding: 0">
          {{ tr.myTasks }}{{ filtered.length ? `: ${filtered.length}` : '' }}
        </ion-title>
        <img slot="end" :src="getFlagImg(lang)" :alt="lang" width="30" @click="$('#langSelect').click()"
          style="margin-right: 8px" />
        <ion-select v-show="false" v-model="lang" id="langSelect" v-bind="selectParams(tr.selectLang)">
          <ion-select-option v-for="lang in langs" :value="lang.value">
            {{ lang.label }}
          </ion-select-option>
        </ion-select>
        <ion-icon :icon="isDarkMode ? moon : sunny" slot="end" size="large" @click="toggleDarkMode"
          style="margin-right: 8px" />
      </ion-toolbar>
      <ion-item>
        <ion-searchbar v-model="keyword" :placeholder="tr.search" :debounce="500" :maxlength="40"
          show-clear-button="always" :search-icon="params.searchInDesc ? searchCircleOutline : searchSharp"
          style="padding: 5px 8px 5px 0" />
        <ion-select v-show="false" id="fSelect" v-model="filters" multiple v-bind="selectParams(tr.filters)">
          <OptionsGroup :label="tr.byPriorities" />
          <ion-select-option value="low">{{ tr.low }}</ion-select-option>
          <ion-select-option value="medium">{{ tr.medium }}</ion-select-option>
          <ion-select-option value="high">{{ tr.high }}</ion-select-option>
          <OptionsGroup :label="tr.others" />
          <ion-select-option value="archived">{{ tr.archived }}</ion-select-option>
          <ion-select-option value="notificated">{{ tr.notificated }}</ion-select-option>
        </ion-select>
        <ion-icon :icon="funnel" @click="$('#fSelect').click()"
          :color="filters.length === 3 && isEqual(filters, priorities) ? '' : 'primary'" />
      </ion-item>
      <ion-item>
        <ion-input :placeholder="tr.newTask" v-model="title" :maxlength="40" clear-input
          @keyup.enter="addTask(title)" />
        <ion-icon :icon="addCircle" size="large" color="primary" @click="addTask(title)" />
      </ion-item>
    </ion-header>

    <ion-content>
      <ion-list ref="listRef" v-if="filtered.length">
        <ion-item-sliding v-for="task in filtered" :key="task.id">
          <ion-item-options side="start" @ion-swipe="toggleArchived(task)">
            <ion-item-option color="success" expandable @click="toggleArchived(task)">
              <ion-icon slot="icon-only" :icon="task.archived ? arrowUpCircleOutline : arrowDownCircleOutline" />
            </ion-item-option>
          </ion-item-options>
          <ion-item button @click="openTask(task)">
            <ion-label class="task-title">{{ task.title }}</ion-label>
            <ion-icon v-if="task.archived" :icon="archiveOutline" size="small" style="margin-right: 2px" />
            <ion-icon v-if="new Date() < new Date(task.notification)" :icon="alarmOutline" size="small"
              style="margin-right: 2px" />
            <ion-icon :icon="ellipse" size="small" :color="priorityType[task.priority]" />
          </ion-item>
          <ion-item-options side="end" @ion-swipe="removeTask(task)">
            <ion-item-option color="danger" expandable @click="removeTask(task)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      <h1 v-else class="ion-text-center">{{ listTitle }}</h1>

      <ion-modal :is-open="isOpen" @didDismiss="isOpen = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ tr.detailInfo }}</ion-title>
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
              <ion-input :label="tr.created" v-model="current.created" readonly label-placement="fixed" />
            </ion-item>
            <ion-item>
              <ion-input :label="tr.changed" v-model="current.changed" readonly label-placement="fixed" />
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
  addCircle, checkmark, close, ellipse, funnel, sunny, moon, mailOutline, powerOutline,
  informationCircleOutline, settingsOutline, starOutline, shareSocialOutline, trashOutline,
  arrowUpCircleOutline, arrowDownCircleOutline, archiveOutline, alarmOutline,
  radioOutline, musicalNoteOutline, searchCircleOutline, searchSharp, filterSharp, documentTextOutline,
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { Storage } from "@ionic/storage";
import UiToggle from "@/components/UiToggle.vue";
import { computed, onMounted, reactive, ref, watch, h } from "vue";
import { onClickOutside } from '@vueuse/core';
import { Translations, langs } from "@/translations.js";
import { nanoid, customAlphabet } from "nanoid";
import { toast, confirm, alert, clone, isEqual, $, delay } from "@/utils.js";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { Haptics } from "@capacitor/haptics";

const getFlagImg = (name) => new URL(`../assets/flags/${name}.png`, import.meta.url).href

const numNanoid = customAlphabet('123456789', 8)
const log = console.log

const IconText = ({ text, icon }) =>
  h(IonItem, { button: true }, () => [
    h(IonIcon, { icon, style: 'margin-right: 10px' }), h(IonLabel, () => text)
  ])

const OptionsGroup = ({ label }) =>
  h(IonSelectOption, { disabled: true, class: 'options-group' }, () => label)

const selectParams = (label) => ({ cancelText: tr.cancel, interfaceOptions: { header: label } })

// #region X// #endregion

// #region Menu
const menuRef = ref()
const isOpen2 = ref(false)
const contactLink = 'mailto:azatgt96@gmail.com?subject=My%20Tasks%20Support&body='
const appLink = 'https://play.google.com/store/apps/details?id=com.kvarta.memorytraining'

const audio = new Audio('/click.wav')
const params = reactive({})

watch(params, (val) => storage.set('params', JSON.stringify(val)), { deep: true })

const contactUs = () => window.location.href = contactLink

const shareApp = () => Share.share({ text: tr.shareText, url: appLink })

const rateApp = () => window.location.href = appLink

const showAppInfo = () => {
  const assetsLinks = `\n\n${tr.flagIcons}:\nhttps://www.flaticon.com\n${tr.sounds}:\nhttps://mixkit.co/free-sound-effects`
  alert(tr.aboutText + assetsLinks, tr.appInfo)
}

const deleteAll = () => {
  if (!tasks.value.length) return toast(tr.noTasksToDelete)
  confirm(tr.aysToDelete, () => {
    tasks.value = []
    saveTasks()
    toast(tr.allDeleted)
  })
}

const exportToPdf = () => { }
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
const priorities = Object.keys(priorityType)
const keyword = ref('')
const filters = ref([])
const sorts = ['createdDate', 'changedDate', 'titles', 'priorities', 'notifications']
const priorityNum = { low: 0, medium: 1, high: 2 }

watch(filters, (val) => {
  storage.set('filters', JSON.stringify(val))
})

const filtered = computed(() => {
  const _filter = filters.value
  const _keyword = keyword.value.toLowerCase()
  let result = []

  const onlyAllPriorities = _filter.length === 3 && isEqual(_filter, priorities)
  if (!_keyword.trim() && onlyAllPriorities) result = tasks.value.filter(it => !it.archived)

  result = tasks.value.filter(it => {
    let result = it.title.toLowerCase().includes(_keyword)
    if (params.searchInDesc) result ||= it.description.toLowerCase().includes(_keyword)
    result &&= _filter.includes(it.priority)
    if (!_filter.includes('archived')) result &&= !it.archived
    if (_filter.includes('notificated')) result &&= new Date() < new Date(it.notification)
    return result
  })

  return result.sort((t1, t2) => {
    const sortBy = params.sortBy
    if (sortBy === 'createdDate') return new Date(t1.created) - new Date(t2.created)
    if (sortBy === 'changedDate') return new Date(t1.changed) - new Date(t2.changed)
    if (sortBy === 'titles') return t1.title.localeCompare(t2.title)
    if (sortBy === 'priorities') return priorityNum[t1.priority] - priorityNum[t2.priority]
    if (sortBy === 'notifications') return new Date(t1.notification) - new Date(t2.notification)
  })
})

const listTitle = computed(() => {
  if (!tasks.value.length) return tr.emptyList
  if (!filtered.value.length) return tr.tasksNotFound
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
  if (params.sound) audio.play()
  if (params.vibro) await Haptics.vibrate({ duration: 40 })
}

const openTask = (task) => {
  current.value = clone(task)
  isOpen.value = true
}

const changeTask = (cur) => {
  cur.title = cur.title.trim()
  if (!cur.title) return toast(tr.titleIsEmpty, 'warning')
  if (tasks.value.find(it => it.title === cur.title && it.id !== cur.id))
    return toast(tr.taskExists, 'warning')
  const idx = tasks.value.findIndex(it => it.id === cur.id)
  if (!isEqual(cur, tasks.value[idx])) {
    tasks.value[idx] = cur
    tasks.value[idx].changed = new Date().toLocaleString()
    if (new Date() < new Date(cur.notification))
      scheduleNotification(+numNanoid(), 'My Tasks', cur.notification, cur.title)

    toast(tr.taskChanged)
    saveTasks()
  }

  isOpen.value = false
}

const addTask = (_title) => {
  _title = _title.trim()
  if (tasks.value.find(it => it.title === _title))
    return toast(tr.taskExists, 'warning')
  title.value = ''
  if (!_title) return toast(tr.titleIsEmpty, 'warning')

  const newTask = new Task(_title)
  tasks.value.push(newTask)
  toast(tr.taskAdded)
  saveTasks()
}

const removeTask = (task) => {
  const idx = tasks.value.findIndex(it => it.id === task.id)
  tasks.value.splice(idx, 1)
  toast(tr.taskDeleted)
  saveTasks()
}

const toggleArchived = async (task) => {
  const idx = tasks.value.findIndex(it => it.id === task.id)
  listRef.value?.$el.closeSlidingItems()
  await delay(200)
  const isArchived = !task.archived
  tasks.value[idx].archived = isArchived
  tasks.value[idx].changed = new Date().toLocaleString()

  saveTasks()
  toast(isArchived ? tr.taskArchived : tr.taskUnarchived)
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
  tasks.value = storedTasks ? JSON.parse(storedTasks) : []

  isDarkMode.value = await storage.get('darkMode')
  document.documentElement.classList.toggle('ion-palette-dark', isDarkMode.value)

  const navLang = window.navigator.language.split('-')[0].toUpperCase()
  const _langs = Object.keys(Translations)

  lang.value = (await storage.get('lang')) ?? (_langs.includes(navLang) ? navLang : _langs[0])

  let _params = await storage.get('params')
  _params = _params ? JSON.parse(_params) : { vibro: true, sound: false, searchInDesc: false, sortBy: 'createdDate' }
  Object.assign(params, _params)

  filters.value = JSON.parse(await storage.get('filters')) ?? priorities

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
.options-group .alert-checkbox-icon {
  display: none !important;
}

.options-group .alert-checkbox-label {
  padding-left: 10px !important;
}

.alert-message {
  white-space: pre-wrap;
}

.task-title {
  overflow: hidden;
  white-space: nowrap;
  padding-right: 5px
}
</style>