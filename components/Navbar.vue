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
      <input
        ref="input-search"
        type="text"
        class="input-search"
        :class="{'w-full': searchFocused, 'w-8': !searchFocused}"
        placeholder=""
        @focusin="searchFocusIn"
        @focusout="searchFocusOut"
      >
      <div class="absolute top-0 flex items-center h-full ml-2">
        <search-icon size="1x" class="cursor-pointer" @click="focusToSearch" />
      </div>
    </div>
    <a href="#" class="link">
      <home-icon size="1.25x" />
    </a>
    <a href="#" class="link">
      <box-icon size="1.25x" />
    </a>
    <a href="#" class="link">
      <coffee-icon size="1.25x" />
    </a>
    <a href="#" class="link">
      <layers-icon size="1.25x" />
    </a>
    <a href="#" class="link">
      <mail-icon size="1.25x" />
    </a>
    <div class="language">
      <button class="bg-nature-darker hover:bg-nature-light hover:text-nature-darker text-gray-800 font-bold py-1 px-2 rounded-r">
        EN
      </button>
    </div>
  </nav>
</template>

<script>
import { HomeIcon, SearchIcon, BoxIcon, CoffeeIcon, LayersIcon, MailIcon } from 'vue-feather-icons'

export default {
  name: 'Navbar',
  components: {
    HomeIcon,
    SearchIcon,
    BoxIcon,
    CoffeeIcon,
    LayersIcon,
    MailIcon
  },
  data () {
    return {
      searchFocused: false
    }
  },
  methods: {
    focusToSearch () {
      this.$refs['input-search'].focus()
    },
    searchFocusIn () {
      this.searchFocused = true
    },
    searchFocusOut () {
      this.searchFocused = false
    }
  }
}
</script>

<style scoped>
.navbar {
  @apply bg-nature-dark text-nature-lighter z-20 fixed flex flex-col items-center;
  height: 100vh;
  top: 0;
  left: 0;
}
.link {
  @apply flex flex-col items-center py-2;
}
.link:hover {
  @apply text-nature-darker bg-nature-lighter px-3;
}
.profile {
  @apply mb-6 mt-2 ml-2;
}
.input-search {
  @apply bg-nature-darker text-sm rounded-full py-1 px-2 h-8;
}
.input-search:focus {
  @apply outline-none shadow-outline;
}
.search {
  @apply mb-2 mx-2 relative;
}
.language {
  @apply mt-auto mb-2 self-start;
}
</style>
