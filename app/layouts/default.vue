<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <!-- footer JS (newsletter form) only once it's on screen; cookie notice after the page is idle -->
    <LazyAppFooter hydrate-on-visible />
    <LazyCookieBar hydrate-on-idle />
  </div>
</template>
