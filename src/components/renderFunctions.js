import { IonSelectOption, IonItem, IonIcon, IonLabel, IonNote, IonButton, IonButtons, IonMenuButton } from '@ionic/vue';
import { h } from 'vue';
import * as ionicons from 'ionicons/icons';

// Replaces the last chars {C -> Circle, O -> Outline, S -> Sharp}
const $replace = (str) => str.replace(/C(?![a-z])|O(?![a-z])|S(?![a-z])/g,
  char => ({ C: 'Circle', O: 'Outline', S: 'Sharp' })[char])

export const Ikon = ({ icon, small, ...props }) =>
  h(IonIcon, { icon: ionicons[$replace(icon)], size: small === '' ? 'small' : '', ...props })

export const IconBtn = ({ icon, size, ...props }) =>
  h(IonButton, { shape: 'round', fill: 'clear', ...props },
    () => h(Ikon, { icon, size, slot: 'icon-only' }))

export const IconTextBtn = ({ icon, iconPlace = 'start', text, ...props }) =>
  h(IonButton, { fill: 'clear', ...props }, () => [h(Ikon, { icon, slot: iconPlace }), text])

export const IconText = ({ icon, text, color, ...props }) =>
  h(IonItem, { button: true, ...props },
    () => [h(Ikon, { icon, color, class: 'mr-10' }), h(IonLabel, { color }, () => text)])

export const LabelNote = ({ label, note }) =>
  h(IonLabel, { class: 'shorted' }, () => [label, h(IonNote, () => ` (${note})`)])

export const MenuBtn = () => h(IonButtons, { slot: 'start' }, () => h(IonMenuButton))

export const SelectOption = ({ label, ...props }) => h(IonSelectOption, props, () => label)

export const OptionsGroup = ({ label }) =>
  h(IonSelectOption, { disabled: true, class: 'options-group' }, () => label)