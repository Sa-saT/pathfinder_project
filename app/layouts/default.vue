<template>
    <div class="min-h-screen bg-[url('/background.png')]">
      <!-- 共通ヘッダー -->
      <header class="flex justify-between items-center p-3 bg-sky-700/40 text-white sticky top-0 left-0 w-full backdrop-blur-md">

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
  