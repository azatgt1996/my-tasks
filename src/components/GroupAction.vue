<template>
  <IonToolbar v-show="selected.length" class="group-actions">
    <IconBtn
      slot="start"
      color="medium"
      icon="closeO"
      style="margin: 0 3px"
      @click="selected = []"
    />
    <IonTitle>{{ tr.selected }}: {{ selected.length }}</IonTitle>
    <IconBtn
      slot="end"
      color="primary"
      icon="checkmarkCO"
      @click="completeSelected"
    />
    <IconBtn slot="end" color="danger" icon="trashO" @click="deleteSelected" />
    <IconBtn
      slot="end"
      :color="selected.length === data.length ? 'success' : 'medium'"
      icon="checkmarkDoneO"
      @click="selectAll"
    />
    <IconBtn
      id="more-btn"
      slot="end"
      color="medium"
      icon="ellipsisVertical"
      style="margin: 0 3px"
    />
    <IonPopover trigger="more-btn" dismiss-on-select size="auto">
      <IonContent>
        <IonList lines="none">
          <IconText icon="shareSocialO" :text="tr.send" @click="sendSelected" />
          <IconText
            icon="arrowUndoCO"
            :text="tr.uncompleteTasks"
            @click="uncompleteSelected"
          />
          <IconText
            icon="albumsO"
            :text="tr.changeCategory"
            @click="changeCategory"
          />
          <IconText
            icon="caretUpCO"
            :text="tr.changePriority"
            @click="changePriority"
          />
          <IconText
            icon="alarmO"
            :text="tr.changeNotification"
            @click="$bus.open('NotificationModal')"
          />
        </IonList>
      </IonContent>
    </IonPopover>
  </IonToolbar>
  <NotificationModal @changeNotifications="changeNotifications" />
</template>

<script setup>
import {
  IonContent,
  IonToolbar,
  IonPopover,
  IonList,
  IonTitle,
} from '@ionic/vue';
import { IconBtn, IconText } from '@/components/renderFunctions.js';
import { useGlobalStore } from '@/stores/globalStore';
import { useTaskStore } from '@/stores/taskStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { toRefs } from 'vue';
import {
  $bus,
  getNumId,
  removeNotifications,
  vibrate,
} from '@/helpers/utils.js';
import { emptyDatetime, priorities } from '@/helpers/constants.js';
import NotificationModal from '@/modals/NotificationModal.vue';

const props = defineProps({
  data: { type: Array, default: [] },
});

const { tr, params, toast, confirm, prompt2, share } = useGlobalStore();
const { selected } = toRefs(useTaskStore());
const { tasks, setTasks, saveTasks, changeNotification } = useTaskStore();
const { getCategoryName } = useCategoryStore();

const selectAll = () => {
  if (props.data.length === selected.value.length) selected.value = [];
  else {
    selected.value = props.data.map((item) => item.id);
    if (params.vibro) vibrate(14);
  }
};

const sendSelected = () => {
  const _tasks = tasks.filter((it) => selected.value.includes(it.id));
  share({ text: _tasks.map((it) => `· ${it.title}`).join('\n') });
};

const groupExec = (prop, val) => {
  for (const id of selected.value) {
    const task = tasks.find((it) => it.id === id);
    task[prop] = val;
    changeNotification(task);
  }
  saveTasks();
};

const completeSelected = () => {
  groupExec('completed', true);
  toast(tr.selectedCompleted);
};

const deleteSelected = async () => {
  if (!(await confirm(tr.aysToDeleteSelected))) return;

  const ids = tasks
    .filter((it) => selected.value.includes(it.id))
    .map(getNumId);
  removeNotifications(ids);

  const _tasks = tasks.filter((it) => !selected.value.includes(it.id));
  setTasks(_tasks);
  saveTasks(1);
  toast(tr.selectedDeleted);
};

const changeCategory = () => {
  const options = categories.value
    .slice(1)
    .map((it) => ({ label: getCategoryName(it), value: it }));
  prompt2(tr.selectCategory, options, (val) => groupExec('category', val));
};

const changePriority = () => {
  const options = priorities.map((it) => ({
    label: tr[it],
    value: it,
    cssClass: `${it}-item`,
  }));
  prompt2(tr.selectPriority, options, (val) => groupExec('priority', val));
};

const uncompleteSelected = () => groupExec('completed', false);

const changeNotifications = (val) => {
  groupExec('notification', val ?? emptyDatetime);
  $bus.close('NotificationModal');
};
</script>

<style lang="sass">
.group-actions > ion-button
  margin: 0
</style>
