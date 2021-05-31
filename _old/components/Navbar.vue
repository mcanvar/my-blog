<template>
  <nav class="navbar">
    <div class="profile">
      <img
        src="https://secure.gravatar.com/avatar/57c8ad1723d2b40f41babd8bc20e281b?s=192&r=g"
        alt="MC"
      >
    </div>
    <div class="search">
      <input
        ref="input-search"
        v-model="keywords"
        type="text"
        :class="{'w-full': focused, 'w-8': !focused}"
        placeholder=""
        @focusin="searchFocusIn"
        @focusout="searchFocusOut"
      >
      <div class="search-icon" :class="{'right-0': focused}">
        <search-icon
          size="1x"
          @click="focusToSearch"
        />
      </div>
    </div>
    <a href="#" class="link" :class="{'justify-start pl-5': focused, 'justify-center': !focused}">
      <home-icon size="1.25x" />
      <span v-show="focused">Homepage</span>
    </a>
    <a href="#" class="link" :class="{'justify-start pl-5': focused, 'justify-center': !focused}">
      <box-icon size="1.25x" />
      <span v-show="focused">My Projects</span>
    </a>
    <a href="#" class="link" :class="{'justify-start pl-5': focused, 'justify-center': !focused}">
      <coffee-icon size="1.25x" />
      <span v-show="focused">Coffee Store</span>
    </a>
    <a href="#" class="link" :class="{'justify-start pl-5': focused, 'justify-center': !focused}">
      <layers-icon size="1.25x" />
      <span v-show="focused">Categories</span>
    </a>
    <a href="#" class="link" :class="{'justify-start pl-5': focused, 'justify-center': !focused}">
      <mail-icon size="1.25x" />
      <span v-show="focused">Say Hi to me!</span>
    </a>
    <div class="language">
      <button>
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
      keywords: '',
      focused: false
    }
  },
  methods: {
    focusToSearch () {
      this.$refs['input-search'].focus()
    },
    searchFocusIn () {
      this.focused = true
    },
    searchFocusOut () {
      this.focused = false
      this.keywords = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  @apply bg-nature-dark text-nature-lighter z-20 fixed flex flex-col items-center;
  height: 100vh;
  top: 0;
  left: 0;

  .link {
    @apply flex py-2 w-full;

    &:hover {
      @apply text-nature-darker bg-nature-lighter px-3;
    }

    span {
      @apply ml-1 text-lg leading-5;
    }
  }

  .search {
    @apply mb-2 mx-2 relative;

    input {
      @apply bg-nature-darker text-sm rounded-full py-1 px-2 h-8;

      &:focus {
        @apply outline-none shadow-outline;
      }
    }

    .search-icon {
      @apply absolute top-0 flex items-center h-full mx-2;

      svg {
        @apply cursor-pointer;
      }
    }
  }

  .profile {
    @apply mb-6 mt-2;

    img {
      @apply rounded-full w-8 h-8;
    }
  }

  .language {
    @apply mt-auto mb-2 self-start;

    button {
      @apply bg-nature-darker font-bold py-1 px-2 rounded-r;

      &:hover {
        @apply bg-nature-light text-nature-darker;
      }
    }
  }
}
</style>
