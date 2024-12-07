import { IonSelectOption, IonItem, IonIcon, IonLabel, IonButton } from '@ionic/vue';
import * as icons from 'ionicons/icons';
import { h } from 'vue';

const iconMap = {
  check: icons.checkmarkOutline,
  checkCircle: icons.checkmarkCircleOutline,
  checkDone: icons.checkmarkDoneOutline,
  alarm: icons.alarmOutline,
  add: icons.addOutline,
  filter: icons.filterSharp,
  search: icons.searchSharp,
  searchCircle: icons.searchCircleOutline,
  trash: icons.trashOutline,
  arrowUndo: icons.arrowUndoCircleOutline,

  ellipse: icons.ellipse,
  sunny: icons.sunny,
  moon: icons.moon,
}

export const Ikon = ({ icon, small, ...props }) =>
  h(IonIcon, { icon: iconMap[icon], size: small === '' ? 'small' : '', ...props })

export const IconBtn = ({ icon, size, ...props }) =>
  h(IonButton, { shape: 'round', fill: 'clear', ...props },
    () => h(IonIcon, { icon, size, slot: 'icon-only' }))

export const IconTextBtn = ({ icon, iconPlace = 'start', text, ...props }) =>
  h(IonButton, { fill: 'clear', ...props },
    () => [h(IonIcon, { icon, slot: iconPlace }), text]
  )

export const IconText = ({ icon, text, color, ...props }) =>
  h(IonItem, { button: true, ...props }, () => [
    h(IonIcon, { icon, color, class: 'mr-10' }), h(IonLabel, { color }, () => text)
  ])

export const OptionsGroup = ({ label }) =>
  h(IonSelectOption, { disabled: true, class: 'options-group' }, () => label)