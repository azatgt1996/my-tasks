import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCategoryStore = defineStore('categoryStore', () => {
  const baseCategories = ['allCategories', 'common', 'private', 'work']
  const category = ref('allCategories')
  const categories = ref([])

  return { category, categories, baseCategories }
})