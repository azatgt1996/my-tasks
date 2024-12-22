import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGlobalStore } from "@/stores/globalStore";

export const useCategoryStore = defineStore('categoryStore', () => {
  const { tr } = useGlobalStore()

  const category = ref('allCategories')
  const categories = ref([])

  const baseCategories = ['allCategories', 'common', 'private', 'work']
  const getCategoryName = (name) => baseCategories.includes(name) ? tr[name] : name

  return { category, categories, baseCategories, getCategoryName }
})