import { defineStore } from 'pinia'
import { onBeforeMount, reactive, ref } from 'vue'
import { toastController, alertController } from '@ionic/vue'
import { Storage } from "@ionic/storage";
import { Share } from '@capacitor/share';

export const useGlobalStore = defineStore('globalStore', () => {
  const storage = new Storage()
  const tr = reactive({})
  const lang = ref('')
  const params = reactive({}) // setting params

  const localeDate = (date, noTime = false) => {
    const dt = date ? new Date(date) : new Date()
    if (noTime) return dt.toLocaleDateString(tr._code)
    return dt.toLocaleString(tr._code)
  }

  const cancelToast = (message, callback, duration = 3000) => {
    toastController.dismiss()
    toastController.create({
      message, duration, animated: true, color: 'secondary',
      buttons: [{ text: tr.cancel, handler: callback }]
    }).then(toast => toast.present())
  }

  const baseToast = (message, color, duration) => {
    if (params.offToastAlerts) return
    toastController.dismiss()
    toastController.create({ message, duration, animated: true, color }).then(toast => toast.present())
  }

  const toast = (message) => baseToast(message, 'secondary', 1500)

  const errToast = (message) => baseToast(message, 'danger', 2000)

  const alert = (message, header = tr.attention) =>
    alertController.create({ header, message, buttons: ['Ok'] })
      .then(alert => alert.present())

  const confirm = (message, callback) =>
    alertController.create({
      header: tr.attention, message,
      buttons: [tr.cancel, { text: 'Ok', role: 'ok', handler: callback }]
    }).then(async alert => {
      alert.present()
      const { role } = await alert.onDidDismiss()
      return role === 'ok'
    })

  const onOkClick = (data, isInput, callback) => {
    if (!data) {
      errToast(isInput ? tr.fillField : tr.selectValue)
      return false
    }
    callback(data)
    return true
  }

  const prompt = (header, placeholder, value, callback) =>
    alertController.create({
      inputs: [{ placeholder, value, attributes: { maxlength: 20 } }],
      header, buttons: [tr.cancel, { text: 'Ok', handler: data => onOkClick(data[0].trim(), true, callback) }],
    }).then(alert => alert.present())

  const prompt2 = (header, options, callback) =>
    alertController.create({
      inputs: options.map(it => ({ type: 'radio', ...it })),
      header, buttons: [tr.cancel, { text: 'Ok', handler: data => onOkClick(data, false, callback) }],
    }).then(alert => alert.present())

  const share = (data) => Share.share({ dialogTitle: tr.shareUsing, ...data })

  onBeforeMount(() => storage.create())

  return { tr, params, storage, lang, localeDate, toast, errToast, cancelToast, alert, confirm, prompt, prompt2, share }
})