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
  QEditor,
  QChatMessage,
  QCard,
  Notify,
  QInput,
  Dialog,
  QDialog,
  QInnerLoading,
  QSpinnerBall,
  Loading,
} from 'quasar'

Vue.use(Quasar, {
  config: {
    animations: 'all',
  }
  ,
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
    QEditor,
    QChatMessage,
    QCard,
    QInput,
    QDialog,
    QInnerLoading,
    QSpinnerBall,
  },
  directives: {
  },
  plugins: {
    Notify,
    Dialog,
    Loading,
  }
 })