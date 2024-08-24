import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { toastController, alertController } from '@ionic/vue'

export const useGlobalStore = defineStore('global', () => {
    const tr = reactive({})
    const params = reactive({}) // setting params

    const toast = (message, color = 'success') =>
        toastController.create({ message, duration: 1500, color, animated: true,  }).then(toast => toast.present())
    
    const alert = (message, header = tr.attention) =>
        alertController.create({ message, header, buttons: ['Ok'] })
            .then(alert => alert.present())
    
    const confirm = (message, callback) =>
        alertController.create({
            message, header: tr.attention,
            buttons: [tr.cancel, { text: 'Ok', handler: callback }]
        }).then(alert => alert.present())
    
    
    return { tr, params, toast, alert, confirm }
})