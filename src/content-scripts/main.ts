import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";

window.onload = async () => {
  const el = document.querySelector('body');
  if (el) {
    el.insertAdjacentHTML(
      'afterend',
      '<div id="app">HELLO MOM</div>',
    );
    const app = createApp(App).use(createPinia());
    app.mount('#app');
  }
}