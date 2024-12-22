<template>
  <IonLabel class="shorted" :class="{ striked: task.completed }">{{ task.title }}</IonLabel>
  <Ikon v-show="task.completed" icon="checkmarkCO" small style="margin-right: 2px" />
  <Ikon v-show="task.notification !== emptyDatetime" icon="alarmO" small style="margin-right: 2px"
        :style="{ color: isLater(task.notification) ? '' : 'orangered' }" />
  <Ikon icon="ellipse" :color="priorityType[task.priority]" style="font-size: 14px" />
</template>

<script setup>
import { IonLabel } from '@ionic/vue';
import { Ikon } from "@/components/renderFunctions.js";
import { emptyDatetime, priorityType } from "@/helpers/constants.js";
import { isLater } from "@/helpers/utils.js";

defineProps({ task: Object })
</script>