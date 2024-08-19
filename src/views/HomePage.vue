<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title @click="saveTasks">
          {{ tr.MY_TASKS }}{{ filtered.length ? `: ${filtered.length}` : '' }}
        </ion-title>
        <img slot="end" :src="getFlagImg(lang)" :alt="lang" width="30"
          @click="$('#langSelect').click()" style="margin-right: 8px"/>
        <ion-select v-show="false" v-model="lang" id="langSelect" :cancel-text="tr.CANCEL"
          :interface-options="{ header: tr.SELECT_LANG }">
          <ion-select-option v-for="lang of langs" :value="lang.value">
            {{ lang.label }}
          </ion-select-option>
        </ion-select>
        <ion-icon :icon="isDarkMode ? moon : sunny" slot="end" size="large" @click="toggleDarkMode"
          style="margin-right: 8px" />
      </ion-toolbar>
      <ion-item>
        <ion-searchbar v-model="filter" :placeholder="tr.SEARCH" :debounce="500" maxlength="40"
          show-clear-button="always" style="margin-right: 8px" />
        <ion-select v-show="false" id="priority-select" v-model="selectedPriority" multiple :cancel-text="tr.CANCEL"
          :interface-options="{ header: tr.FILTER_BY_PRIORITY }">
          <ion-select-option value="low">{{ tr.LOW }}</ion-select-option>
          <ion-select-option value="medium">{{ tr.MEDIUM }}</ion-select-option>
          <ion-select-option value="high">{{ tr.HIGH }}</ion-select-option>
        </ion-select>
        <ion-icon :icon="funnel" @click="$('#priority-select').click()"
          :color="selectedPriority.length < 3 ? 'primary' : ''" />
      </ion-item>
      <ion-item>
        <ion-input :placeholder="tr.NEW_TASK" v-model="title" maxlength="30" clear-input
          @keyup.enter="addTask(title)" />
        <ion-icon :icon="addCircle" size="large" color="primary" @click="addTask(title)" />
      </ion-item>
    </ion-header>

    <ion-content>
      <ion-list v-if="filtered.length">
        <ion-item-sliding v-for="task in filtered" :key="task.id">
          <ion-item button @click="openTask(task)">
            <ion-label>{{ task.title }}</ion-label>
            <ion-icon :icon="ellipse" size="small" :color="priorityType[task.priority]" />
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger">
              <ion-icon slot="icon-only" :icon="trash" @click="removeTask(task)" />
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
              <ion-button @click="changeTask">
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
                <ion-segment-button value="low">
                  <ion-label color="success">{{ tr.LOW }}</ion-label>
                </ion-segment-button>
                <ion-segment-button value="medium">
                  <ion-label color="warning">{{ tr.MEDIUM }}</ion-label>
                </ion-segment-button>
                <ion-segment-button value="high">
                  <ion-label color="danger">{{ tr.HIGH }}</ion-label>
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
  IonButton, IonContent, IonHeader, IonIcon, IonInput, IonToolbar, IonModal, IonSearchbar, IonDatetime,
  IonItem, IonLabel, IonList, IonPage, IonTitle, toastController, IonButtons, IonDatetimeButton,
  IonSegment, IonSegmentButton, IonTextarea, IonItemSliding, IonItemOptions, IonItemOption,
  IonSelect, IonSelectOption, useBackButton, useIonRouter,
} from '@ionic/vue';
import { App } from '@capacitor/app';
import { addCircle, trash, checkmark, close, ellipse, funnel, sunny, moon } from 'ionicons/icons';
import { Storage } from "@ionic/storage";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { Translations, langs } from "@/translations.js";
import { nanoid } from "nanoid";

const getFlagImg = name => new URL(`../assets/flags/${name}.png`, import.meta.url).href

const toast = (message, color = 'success') =>
  toastController.create({ message, duration: 1500, color, animated: true }).then(msg => msg.present())

const clone = (obj) => JSON.parse(JSON.stringify(obj))
const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2)
const $ = (_) => document.querySelector(_), $$ = (_) => document.querySelectorAll(_)

const current = ref({})
const isOpen = ref(false)
const title = ref('')
const filter = ref('')
const tasks = ref([])
const priorityType = { low: 'success', medium: 'warning', high: 'danger' }
const selectedPriority = ref(Object.keys(priorityType))

const storage = new Storage()
const ionRouter = useIonRouter()
useBackButton(-1, async () => {
  if (!ionRouter.canGoBack()) {
    await saveTasks()
    App.exitApp()
  }
})

const saveTasks = async () => {
  const storedTasks = JSON.stringify(tasks.value)
  await storage.set('storedTasks', storedTasks)
}

const lang = ref()
const tr = reactive({})
watch(lang, async (val) => {
  await storage.set('lang', val)
  Object.assign(tr, Translations[val])
})

const filtered = computed(() => {
  if (!filter.value.trim() && selectedPriority.value.length === 3) return tasks.value
  return tasks.value.filter(it => {
    return it.title.toLowerCase().includes(filter.value.toLowerCase())
      && selectedPriority.value.includes(it.priority)
  })
})

const listTitle = computed(() => {
  if (!tasks.value.length) return tr.EMPTY_LIST
  if (!filtered.value.length) return tr.TASKS_NOT_FOUND
})

class Task {
  constructor(title, description = '', notification = null) {
    this.id = nanoid()
    this.title = title
    this.created = new Date().toLocaleString()
    this.changed = new Date().toLocaleString()
    this.description = description
    this.priority = 'low'
    this.notification = notification ?? '2020-01-01T18:00:00'
  }
}

const openTask = (task) => {
  current.value = clone(task)
  isOpen.value = true
}

const changeTask = () => {
  current.value.title = current.value.title.trim()
  const { id, title } = current.value
  if (!title) return toast(tr.TITLE_NOT_VALID, 'warning')
  if (tasks.value.find(it => it.title === title && it.id !== id))
    return toast(tr.TASK_EXISTS, 'warning')
  const idx = tasks.value.findIndex(it => it.id === id)
  if (!isEqual(current.value, tasks.value[idx])) {
    tasks.value[idx] = current.value
    tasks.value[idx].changed = new Date().toLocaleString()
    toast(tr.TASK_CHANGED)
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
}

const removeTask = (task) => {
  tasks.value = tasks.value.filter(it => it.id !== task.id)
  toast(tr.TASK_DELETED)
}

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
})

</script>

<style scoped>
ion-searchbar {
  --box-shadow: 0px;
  padding: 0px;
}
</style>