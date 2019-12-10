import Vue from 'vue'

import './styles/quasar.styl'
import '@quasar/extras/material-icons/material-icons.css'
import {
  Quasar, 
  QLayout,
  QHeader,
  QDrawer,
  QPageContainer,
  QPage,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  QList,
  QItem,
  QItemSection,
  QItemLabel,

  // QListHeader,
  // QItemMain,
  // QItemSeparator,
  // QItemSide,
  // QItemTile,

  QEditor,
  QChatMessage,
  QCard,
  Notify,
  QInput,
  Dialog,
  QDialog,
} from 'quasar'

Vue.use(Quasar, {
  config: {},
  components: {
    QLayout,
    QHeader,
    QDrawer,
    QPageContainer,
    QPage,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QItem,
    QItemSection,
    QItemLabel,

    // QListHeader,
    // QItemMain,
    // QItemSeparator,
    // QItemSide,
    // QItemTile,

    QEditor,
    QChatMessage,
    QCard,
    QInput,
    QDialog,
  },
  directives: {
  },
  plugins: {
    Notify,
    Dialog,
  }
 })