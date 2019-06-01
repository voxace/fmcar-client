<template>
  <q-page class="flex flex-center" @keyup.enter="authorize">
    <q-card class="auth-card">
      <q-tabs
        v-model="mode"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="login" label="Login"/>
        <q-tab name="register" label="Register" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="mode" animated class="q-px-xs q-pt-md">
        <q-tab-panel name="login">
          <q-input
            v-model="loginModel.email" label="Email" outlined
            :rules="[ val => val && val.length > 0 || 'Please enter an email address']"
          />
          <q-input
            v-model="loginModel.password" type="password" label="Password" outlined
            :rules="[ val => val && val.length > 0 || 'Please enter a password']"
          />
        </q-tab-panel>

        <q-tab-panel name="register">
          <q-input
            v-model="registerModel.email" label="Email" outlined
            :rules="[ val => val && val.length > 0 || 'Please enter an email address']"
          />
          <q-input
            v-model="registerModel.password" type="password" label="Password" outlined
            :rules="[ val => val && val.length > 0 || 'Please enter a password']"
          />
        </q-tab-panel>
      </q-tab-panels>
      <q-card-actions align="right" class="text-primary">
        <q-btn
          flat :label="mode" class="q-mr-sm q-mb-xs"
          text-color="primary"
          @click="authorize"
          :disabled="!authValidation"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<style scoped>
.auth-card {
  margin: auto;
  width: 500px;
  max-width: 90vw;
}
</style>

<script>
/* eslint-disable no-restricted-globals */
export default {
  name: 'Login',
  meta: {
    title: 'Login',
    titleTemplate: title => `FMCAR - ${title}`,
    meta: {
      description: { name: 'FMCAR Login/Register', content: 'Login/Register' },
      keywords: { name: 'fmcar forza xbox racing', content: 'FMCAR' },
      equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
    },
  },
  data() {
    return {
      mode: this.$route.params.mode,
      registerModel: {
        email: null,
        password: null,
      },
      loginModel: {
        email: null,
        password: null,
      },
    };
  },
  created() {
    if (this.$route.path === '/login') {
      this.mode = 'login';
    }
    if (this.$route.path === '/register') {
      this.mode = 'register';
    }
  },
  watch: {
    mode(val) {
      history.pushState(
        { urlPath: val },
        '',
        val,
      );
    },
  },
  methods: {
    authorize() {
      if (this.authValidation && this.mode === 'login') {
        this.login();
      }
      if (this.authValidation && this.mode === 'register') {
        this.register();
      }
    },
    async register() {
      await this.$axios
        .post('/auth/register', { model: this.registerModel })
        .then((response) => {
          this.$q.notify({
            message: 'Succesfully Registered!',
            color: 'green',
          });
          console.log(response);
          this.loginModel.email = response.email;
          this.mode = 'login';
        })
        .catch((err) => {
          console.log(err);
          this.$q.notify({
            message: 'Email Already Registered',
            color: 'red',
          });
        });
    },
    async login() {
      await this.$axios
        .post('/auth/login', { model: this.loginModel })
        .then((response) => {
          this.$q.notify({
            message: 'Succesfully Logged In!',
            color: 'green',
          });
          console.log(response);
          this.$router.push({ path: '/' });
          this.$store.commit('setUser', response.data.user);
          this.$store.commit('setJWTtoken', response.data.token);
          this.$q.cookies.set('fmcar-user', response.data.user, { expires: 3, path: '/' });
          this.$q.cookies.set('fmcar-token', response.data.token, { expires: 3, path: '/' });
        })
        .catch((err) => {
          console.log(err);
          this.$q.notify({
            message: 'Incorrect Email Address or Password!',
            color: 'red',
          });
        });
    },
  },
  computed: {
    authValidation() {
      if (this.mode === 'login') {
        return this.loginModel.email != null && this.loginModel.email.length > 0
          && this.loginModel.password != null && this.loginModel.password.length > 0;
      }
      if (this.mode === 'register') {
        return this.registerModel.email != null && this.registerModel.email.length > 0
          && this.registerModel.password != null && this.registerModel.length > 0;
      }
      return false;
    },
  },
};
</script>
