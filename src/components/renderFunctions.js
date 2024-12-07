import { IonSelectOption, IonItem, IonIcon, IonLabel, IonButton } from '@ionic/vue';
import { h } from 'vue';
import iconMap from '@/constants/iconMap';

export const Ikon = ({ icon, small, ...props }) =>
  h(IonIcon, { icon: iconMap[icon], size: small === '' ? 'small' : '', ...props })

export const IconBtn = ({ icon, size, ...props }) =>
  h(IonButton, { shape: 'round', fill: 'clear', ...props },
    () => h(Ikon, { icon, size, slot: 'icon-only' }))

export const IconTextBtn = ({ icon, iconPlace = 'start', text, ...props }) =>
  h(IonButton, { fill: 'clear', ...props },
    () => [h(Ikon, { icon, slot: iconPlace }), text]
  )

export const IconText = ({ icon, text, color, ...props }) =>
  h(IonItem, { button: true, ...props }, () => [
    h(Ikon, { icon, color, class: 'mr-10' }), h(IonLabel, { color }, () => text)
  ])

export const OptionsGroup = ({ label }) =>
  h(IonSelectOption, { disabled: true, class: 'options-group' }, () => label)