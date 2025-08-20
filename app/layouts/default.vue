<template>
    <div class="min-h-screen bg-[url('/background.png')]">
      <!-- 共通ヘッダー -->
      <header class="flex justify-between items-center p-3 bg-sky-700/40 text-white sticky top-0 left-0 w-full backdrop-blur-md">
        <h1 class="text-2xl font-[Alkatra] font-bold">{{ titleForRole }}</h1>
        <div class="flex space-x-2">
          <!-- ハンバーガーメニュー（モバイル） -->
          <div class="relative" @click="toggleMenu">
            <img
              src="/kapi.png"
              alt="menu"
              class="size-15 cursor-pointer rounded-full border border-gray-300 bg-white object-cover"
            />
      <!-- ドロップダウンメニュー -->
      <ul
        v-show="menuOpen"
        @click.stop
        class="absolute right-0 mt-2 w-48 bg-neutral-700/30 rounded-md shadow-lg border"
      >
        <li
          v-for="(item, idx) in menuItems"
          :key="idx"
          class="px-4 py-2 hover:text-shadow-lg/30 cursor-pointer"
          @click="onSelect(item)"
        >
          {{ item.label }}
        </li>
      </ul>
    </div>

        </div>
      </header>
      <!-- 各ページの内容が入る -->
      <main class="p-4">
        <slot />
      </main>
      <footer class="inset-x-0 bottom-0 bg-sky-700/40 text-white text-center py-2 backdrop-blur-md">
        <span class="text-sm">&copy; 2025- PATHFINDER. All rights reserved.</span>
      </footer>
    </div>
  </template>
  
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { navigateTo } from 'nuxt/app'

const { authStore, deactivateDevice } = useAuth()
const menuOpen = ref(false)

// メニュー項目をユーザー情報に応じて生成
const menuItems = computed(() => {
  const items = [] as { label: string, key: string, disabled?: boolean }[]
  if (authStore.user?.email) {
    items.push({ label: authStore.user.email, key: 'email', disabled: true })
  }
  items.push({ label: 'logout', key: 'logout' })
  if (authStore.user?.account_type === 'user') {
    items.push({ label: 'deactivate', key: 'deactivate' })
  }
  return items
})

const toggleMenu = (e: Event) => {
  menuOpen.value = !menuOpen.value
}

// メニュー選択時の処理
const onSelect = (item: { label: string, key: string, disabled?: boolean }) => {
  if (item.disabled) return
  menuOpen.value = false
  if (item.key === 'logout') {
    logout()
  } else if (item.key === 'deactivate') {
    handleDeactivate()
  }
}

// 外部クリックでメニューを閉じる
const handleClickOutside = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    menuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const logout = async () => {
  await authStore.logout()
  await navigateTo('/login')
}

// ロールに応じたタイトル
const titleForRole = computed(() => {
  switch (authStore.user?.account_type) {
    case 'admin':
      return '管理者 PATHFINDER'
    case 'creator':
      return 'Creator PATHFINDER'
    case 'user':
      return 'PATHFINDER'
    default:
      return 'Login PATHFINDER'
  }
})

const handleDeactivate = async () => {
  if (!confirm('この端末をディアクティベートしますか？')) return

  try {
      await deactivateDevice()
      navigateTo('/login')
  } catch (err) {
      alert((err as Error).message)
  }
}
</script>
