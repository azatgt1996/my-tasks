import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { toastController, alertController } from '@ionic/vue'
import { Storage } from "@ionic/storage";

export const useGlobalStore = defineStore('global', () => {
    const storage = new Storage()
    const tr = reactive({})
    const params = reactive({}) // setting params

    const selectProps = (label, message) => ({ cancelText: tr.cancel, interfaceOptions: { header: label, message } })

    const toast = (message, color = 'success') => {
        if (params.offToastAlerts) return
        toastController.create({ message, duration: 1500, color, animated: true,  }).then(toast => toast.present())
    }
    
    const alert = (message, header = tr.attention) =>
        alertController.create({ header, message, buttons: ['Ok'] })
            .then(alert => alert.present())
    
    const confirm = (message, callback) =>
        alertController.create({
            header: tr.attention, message,
            buttons: [tr.cancel, { text: 'Ok', handler: callback }]
        }).then(alert => alert.present())
    
    
    const onOkClick = (data, callback) => {
        const result = data[0].trim()
        if (!result) {
            toast(tr.fillField, 'warning')
            return false
        }
        callback(result)
        return true
    }
    
    const prompt = (header, message, placeholder, callback) =>
        alertController.create({
            header, message,
            inputs: [{ placeholder, max: 20 }],
            buttons: [tr.cancel, { text: 'Ok', handler: data => onOkClick(data, callback) }],
        }).then(alert => alert.present())
    
    return { tr, params, storage, selectProps, toast, alert, confirm, prompt }
})