import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Quasar from "quasar";
import 'quasar/dist/quasar.css'
import quasarIconSet from 'quasar/icon-set/themify'

// Import icon libraries
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/themify/themify.css'

const app = createApp(App).use(store).use(router)
app.use(Quasar, {
    config: {
        dark: true,
        brand: {
            primary: '#15161f',
            secondary: '#3db0fc',
            accent: '#151d42',

            dark: '#151d42',
            'dark-page': '#15161f',

            positive: '#17802f',
            negative: '#800b19',
            info: '#3db0fc',
            warning: '#d6bc74'
        }
    }
})
app.mount("#app");