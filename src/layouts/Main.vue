<template>
  <q-layout view="hHh lpR fFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title>
          <router-link to="/"><img src="../assets/logo.png" class="logo"></router-link>
        </q-toolbar-title>

        <template v-if="$q.screen.gt.sm">
          <template v-for="link in activeLinks">
            <q-btn
              v-if="link.type == 'link'"
              :key="link.to"
              :to="link.to"
              :class="{ 'active-btn': $route.path == link.to }"
              flat
            >
              {{ link.text }}
            </q-btn>
            <q-btn-dropdown
              v-else
              :key="link.to"
              :label="link.text"
              :class="{ 'active-btn': subIsActive(link.to) }"
              flat
            >
              <q-list>
                <q-item
                  v-for="item in link.menu"
                  :key="item.to"
                  @click="$router.push(item.to)"
                  clickable
                >
                  <q-item-section>
                    <q-item-label>
                      {{ item.text }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </template>
        </template>

        <q-btn
          v-else
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="$q.screen.lt.md"
      v-model="leftDrawerOpen"
      side="left"
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <template v-for="link in links">

          <q-item
            v-if="link.type == 'link'"
            :key="link.to"
            :to="link.to"
            active-class="active-list"
            exact
            clickable
          >
            <q-item-section>
              <q-item-label>{{link.text}}</q-item-label>
            </q-item-section>
          </q-item>

          <q-expansion-item
            v-else
            :key="link.to"
            :value="$route.path.includes(link.to)"
            group="menu"
          >
            <template v-slot:header>

              <q-item-section>
                {{link.text}}
              </q-item-section>

            </template>

            <q-list>
              <q-item
                v-for="item in link.menu"
                :key="item.to"
                :to="item.to"
                active-class="active-list"
                exact
                clickable
              >
                <q-item-section>
                  <q-item-label class="menu-item">{{item.text}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { openURL } from 'quasar';

export default {
  name: 'MyLayout',
  expanded: [],
  data() {
    return {
      leftDrawerOpen: false,
      links: [
        {
          to: '/',
          text: 'Home',
          auth: false,
          type: 'link',
        },
        {
          to: '/series',
          text: 'Series',
          auth: false,
          type: 'link',
        },
        {
          to: '/calendar',
          text: 'Calendar',
          auth: false,
          type: 'link',
        },
        {
          to: '/discord',
          text: 'Discord',
          auth: false,
          type: 'link',
        },
        {
          to: '/facebook',
          text: 'Facebook',
          auth: false,
          type: 'link',
        },
        {
          text: 'Admin',
          to: '/admin',
          auth: true,
          loggedIn: true,
          type: 'menu',
          menu: [
            {
              to: '/admin/games',
              text: 'Edit Games',
            },
            {
              to: '/admin/tracks',
              text: 'Edit Tracks',
            },
            {
              to: '/admin/points',
              text: 'Edit Points Tables',
            },
          ],
        },
        {
          to: '/logout',
          text: 'Logout',
          auth: false,
          loggedIn: true,
          type: 'link',
        },
        {
          to: '/login',
          text: 'Login / Register',
          auth: false,
          loggedIn: false,
          type: 'link',
        },
      ],
    };
  },
  created() {
    const user = this.$q.cookies.get('fmcar-user');
    const token = this.$q.cookies.get('fmcar-token');
    if (user !== 'undefined' && token !== 'undefined') {
      this.$store.commit('setUser', user);
      this.$store.commit('setJWTtoken', token);
    }
  },
  methods: {
    openURL,
    subIsActive(input) {
      const paths = Array.isArray(input) ? input : [input];
      return paths.some(path => this.$route.path.indexOf(path) === 0);
    },
  },
  computed: {
    activeLinks() {
      if (this.auth) {
        return this.links.filter(link => (link.auth === false
          || link.auth === this.auth.admin)
          && link.loggedIn !== false);
      }
      return this.links.filter(link => !link.loggedIn);
    },
    auth() {
      return this.$store.state.user;
    },
  },
  watch: {
    $route() {
      this.show = false;
    },
  },
};
</script>

<style>
h3 {
  margin-block-start: 0.2em;
  margin-block-end: 0.5em;
}
.logo {
  width:200px;
  height:auto;
}
.active-btn {
  font-weight: bold;
  background-color: rgba(255,255,255,0.15);
}
.active-list {
  font-weight: bold;
  background-color: rgba(0,0,0,0.15);
}
.menu-item {
  font-size: 0.9em;
  margin-left: 10px;
}
.responsive-img {
  width: 100%;
  height: auto;
}
</style>
