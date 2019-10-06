import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default function () {
  const Store = new Vuex.Store({
    state: {
      editingAllowed: true,
      user: null,
      JWTtoken: null,
      years: [2019, 2020],
    },
    mutations: {
      setUser(state, user) {
        state.user = user;
      },
      setJWTtoken(state, token) {
        state.JWTtoken = token;
      },
      logout(state) {
        state.JWTtoken = null;
        state.user = null;
      },
    },
    getters: {
      editingAllowed: (state) => {
        if (state.user) {
          return state.user.admin;
        }
        return false;
      },
    },
    strict: process.env.DEV,
  });

  return Store;
}
