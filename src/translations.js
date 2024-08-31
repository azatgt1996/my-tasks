const languages = ['EN', 'ES', 'RU']

const translations = {
  _trAuthor: ['Galyautdinov Ilyas', 'Galyautdinov Azat', 'Galyautdinov Azat'],
  _language: ['English', 'Español', 'Русский'],
  needNotifyPermission: [
    'Need a notification permission to set reminder',
    'Necesita un permiso de notificación para configurar un recordatorio',
    'Для установки напоминания необходимо разрешение на получение уведомлений'
  ],
  menu: ['Menu', 'Menú', 'Меню'],
  contactUs: ['Contact us', 'Contacta con nosotros', 'Связаться с нами'],
  deleteAll: ['Delete all tasks', 'Eliminar tareas', 'Удалить все задачи'],
  aysToDelete: [
    'Are you sure? All tasks will be deleted permanently!',
    'Está seguro? Todas las tareas se eliminarán permanentemente!',
    'Вы уверены? Все задачи будут удалены безвозвратно!'
  ],
  allDeleted: ['All tasks deleted', 'Todas las tareas eliminadas', 'Все задачи удалены'],
  share: ['Share the app', 'Comparte la aplicación', 'Поделиться приложением'],
  shareText: [
    'I want to share this app with you',
    'Quiero compartir esta aplicación contigo',
    'Я хочу поделиться с тобой этим приложением'
  ],
  rateApp: ['Rate the app', 'Califica la aplicación', 'Оценить приложение'],
  aboutApp: ['About the app', 'Acerca de la aplicación', 'О приложении'],
  appInfo: ['App info', 'Información de la aplicación', 'Информация о приложении'],
  aboutText: [
    'Author: %s\n\nUsed stacks:\n%s\n\nFlag icons:\n%s\n\nSounds:\n%s\n\n',
    'Autor: %s\n\nTecnologías utilizadas:\n%s\n\nIconos de bandera:\n%s\n\nSonidos:\n%s\n\n',
    'Автор: %s\n\nИспользованные технологии:\n%s\n\nИконки флагов:\n%s\n\nЗвуки:\n%s\n\n'
  ],
  settings: ['Settings', 'Ajustes', 'Настройки'],
  guide: ['Show guide', 'Mostrar entrenamiento', 'Показать обучение'],
  buyPrem: ['Buy premium', 'Comprar prima', 'Купить премиум'],
  exit: ['Close the app', 'Cerrar aplicación', 'Закрыть приложение'],
  attention: ['Attention', 'Atención', 'Внимание'],
  cancel: ['Cancel', 'Cancelar', 'Отмена'],
  paramsSaved: ['Params saved', 'Parámetros guardados', 'Параметры сохранены'],
  vibro: ['Vibration', 'Vibración', 'Вибрация'],
  sound: ['Sound', 'Sonido', 'Звук'],
  searchInDescription: [
    'Search also in description',
    'Buscar también entre descripciones',
    'Искать также среди описания'
  ],
  sortBy: ['Sort by', 'Ordenar por', 'Сортировать по полю'],
  orderByDesc: ['Order by descending', 'Ordenar de manera descendente', 'Сортировать по убыванию'],
  autoCloseAfterSave: ['Auto close after save', 'Autocerrar después de guardar', 'Автозакрытие после сохранения'],

  helpWithTranslation: ['Help with translation', 'Ayuda con la traducción', 'Помочь с переводом'],
  selectExLang: [
    'Select the language for example',
    'Seleccione el idioma por ejemplo',
    'Выберите язык для примера'
  ],
  translation: ['Translation', 'Traducción', 'Перевод'],
  send: ['Send', 'Enviar', 'Отправить'],
  lang: ['Language', 'Idioma', 'Язык'],
  selectLang: ['Select the language', 'Selecciona el idioma', 'Выберите язык'],
  trAuthor: ['Author of the translation', 'Autor de la traducción', 'Автор перевода'],
  fillAllFields: ['Fill in all fields', 'Complete todos los campos', 'Заполните все поля'],

  category: ['Category', 'Categoría', 'Категория'],
  selectCategory: ['Select the category', 'Seleccione la categoría', 'Выберите категорию'],
  categories: ['Categories', 'Categorías', 'Категории'],
  allCategories: ['All categories', 'Todas las categorias', 'Все категории'],
  common: ['Common', 'Comunes', 'Общие'],
  private: ['Private', 'Privadas', 'Личные'],
  work: ['Work', 'Trabajar', 'Работа'],
  newCategory: ['New category', 'Nueva categoria', 'Новая категория'],

  myTasks: ['My Tasks', 'Mis Tareas', 'Мои задачи'],
  search: ['Search...', 'Buscar...', 'Поиск...'],
  newTask: ['Type a new task', 'Escribe una nueva tarea', 'Введите новую задачу'],
  detailInfo: ['Detail info', 'Información detallada', 'Детальная инфа'],
  created: ['Created date', 'Fecha de creación', 'Дата создания'],
  changed: ['Changed date', 'Fecha de modificación', 'Дата изменения'],
  title: ['Title', 'Título', 'Название'],
  priority: ['Priority', 'Prioridad', 'Приоритет'],
  notification: ['Notification', 'Notificación', 'Уведомление'],
  typeTask: ['Type title', 'Escribe el título', 'Введите название'],
  description: ['Description', 'Descripción', 'Описание'],
  typeDescription: ['Type something description', 'Escribe una descripción', 'Введите описание'],
  filters: ['Filters', 'Filtros', 'Фильтры'],
  byPriorities: ['By priorities', 'Por prioridades', 'По приоритетам'],
  low: ['Low', 'Baja', 'Низкий'],
  medium: ['Medium', 'Media', 'Средний'],
  high: ['High', 'Alta', 'Высокий'],
  others: ['Others', 'Otras', 'Другие'],
  completed: ['Completed', 'Completadas', 'Выполненные'],
  notificated: ['Only with notificated', 'Solo con notificado', 'Только с уведомлением'],
  emptyList: ['List is empty yet', 'La lista aún está vacía', 'Список пока пуст'],
  tasksNotFound: ['Tasks not found', 'Tareas no encontradas', 'Задачи не найдены'],
  titleIsEmpty: [
    'Task title must not be empty',
    'El título de la tarea no debe estar vacío',
    'Название не должно быть пустым'
  ],
  taskExists: ['This task already exists', 'Esta tarea ya existe', 'Эта задача уже существует'],
  taskChanged: ['Task changed', 'Tarea cambiada', 'Задача изменена'],
  taskAdded: ['Task added', 'Tarea añadida', 'Задача добавлена'],
  taskDeleted: ['Task deleted', 'Tarea eliminada', 'Задача удалена'],
  taskCompleted: ['Task completed', 'Tarea completada', 'Задача выполнена'],
  taskUncompleted: ['Task uncompleted', 'Tarea incompleta', 'Задача не выполнена'],
  prev: ['Previous', 'Previa', 'Предыдущая'],
  next: ['Next', 'Próxima', 'Следующая'],
}

const Translations = {}

languages.forEach((lang, index) => {
  Translations[lang] = {}
  for (const key in translations)
    Translations[lang][key] = translations[key][index]
})

const langs = Object.keys(Translations)
  .map(key => ({ value: key, label: Translations[key]._language }))

export { Translations, langs }