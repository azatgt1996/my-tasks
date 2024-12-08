import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCategoryStore = defineStore('categoryStore', () => {
    const category = ref('')

    return { category }
})