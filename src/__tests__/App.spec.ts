import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia } from "pinia"
import { createRouter, createWebHistory } from "vue-router"

import App from "@/App.vue"

describe("App", () => {
  it("renders the application shell", async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: "/auth", component: { template: "<div>auth</div>" } }],
    })

    router.push("/auth")
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.text()).toContain("Cash Guard")
  })
})
