<template>
  <nav class="navbar">
    <div class="profile">
      <img
        src="https://secure.gravatar.com/avatar/57c8ad1723d2b40f41babd8bc20e281b?s=192&r=g"
        class="rounded-full w-8 h-8"
        alt="MC"
      >
    </div>
    <div class="search">
      <button class="btn-search">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-4 h-4"
        ><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      </button>
    </div>
    <a href="#" class="link">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-6 h-6 mx-1"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </a>
    <a href="#" class="link">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-6 h-6 mx-1"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    </a>
    <a href="#" class="link">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-6 h-6 mx-1"
      ><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
    </a>
    <a href="#" class="link">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-6 h-6 mx-1"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    </a>
    <a href="#" class="link">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-6 h-6 mx-1"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
      </svg>
    </a>
    <div class="language">
      <button class="bg-nature-darker hover:bg-nature-light hover:text-nature-darker text-gray-800 font-bold py-1 px-2 rounded-r">
        EN
      </button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar'
}
</script>

<style scoped>
.navbar {
  @apply bg-nature-dark text-nature-lighter w-12 z-20 fixed p-2 flex flex-col;
  height: 100vh;
  top: 0;
  left: 0;
}
.link {
  @apply mb-2;
}
.link:hover {
  @apply text-nature-light;
}
.profile {
  @apply mb-6;
}
.btn-search {
  @apply bg-nature-darker rounded-full py-1 px-2;
}
.search {
  @apply mb-2;
}
.language {
  @apply self-end mt-auto;
}
</style>
