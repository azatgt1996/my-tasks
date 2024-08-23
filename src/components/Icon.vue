<template>
    <!-- need install vite-svg-loader -->
    <component :is="icon" :width="size" :height="size" :data-name="name"/>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';

const props = defineProps({
    name: { type: String, required: true },
    size: { type: String, required: false }
})

const icon = computed(() => defineAsyncComponent(() => import(`../assets/icons/${props.name}.svg`)))

</script>