import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default function () {
  const Store = new Vuex.Store({
    state: {
      editingAllowed: true,
      user: null,
      JWTtoken: null,
    },
    mutations: {
      setUser(state, user) {
        state.user = user;
      },
      setJWTtoken(state, token) {
        state.JWTtoken = token;
      },
    },
    strict: process.env.DEV,
  });

  return Store;
}
