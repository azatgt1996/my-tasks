<template>
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
        <IonItem v-for="val in categories.slice(2)" :key="val">
          <IonLabel class="shorted">
            {{ getCategoryName(val) }}
            <IonNote>({{ tasks.filter(it => it.category === val).length }})</IonNote>
          </IonLabel>
          <IconBtn color="primary" size="small" icon="pencilO" @click="renameCategory(val)" />
          <IconBtn color="danger" size="small" icon="trashO" @click="deleteCategory(val)" />
          <IonReorder slot="end" :style="categories.slice(2).length === 1 ? 'pointer-events: none' : ''" />
        </IonItem>
      </IonReorderGroup>
    </IonList>
  </UiModal>
</template>

<script setup>
import { IonButton, IonList, IonItem, IonLabel, IonNote, IonReorderGroup, IonReorder } from '@ionic/vue';
import { IconBtn } from "@/components/renderFunctions.js";
import { useGlobalStore } from '@/stores/globalStore';
import { useTaskStore } from "@/stores/taskStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { clone, getNumId, arrayMove, removeNotifications } from "@/helpers/utils.js";
import { watch, toRefs, onMounted } from 'vue';
import UiModal from "@/components/UiModal.vue";

const { tr, storage, prompt, errToast, confirm, toast } = useGlobalStore()
const { tasks, setTasks, saveTasks } = useTaskStore()

const { baseCategories, getCategoryName } = useCategoryStore()
const { category, categories } = toRefs(useCategoryStore())

watch(category, (val, old) => {
  if (!val) {
    category.value = old
    addCategory(1)
  } else storage.set('category', val)
})

const saveCategories = () => storage.set('categories', JSON.stringify(categories.value))

const addCategory = (isToggle) =>
  prompt(tr.newCategory, tr.typeCategory, '', val => {
    if (categories.value.includes(val)) return errToast(tr.categoryExists)
    categories.value = [...categories.value, val]
    if (isToggle) category.value = val
    saveCategories()
  })

const renameCategory = (_category) => {
  const oldValue = getCategoryName(_category)

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

onMounted(async () => {
  categories.value = JSON.parse(await storage.get('categories')) ?? baseCategories
  category.value = await storage.get('category') ?? 'allCategories'
})
</script>