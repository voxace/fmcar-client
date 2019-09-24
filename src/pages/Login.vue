<template>
  <q-page class="flex flex-center" @keyup.enter="authorize">
    <q-card
      class="auth-card"
      v-bind:class="{
        'tall': mode=='register',
        'short': mode=='login' && !regoComplete,
        'medium': mode=='login' && regoComplete,
      }"
    >
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

        <!-- LOGIN -->
        <q-tab-panel name="login">
          <q-input
            v-model="loginModel.email" label="Email" outlined
            :rules="[ val => val && val.length > 0 || 'Please enter an email address']"
          />
          <q-input
            v-model="loginModel.password" type="password" label="Password" outlined
            :rules="[ val => val && val.length > 0 || 'Please enter a password']"
          />
          <q-banner
            v-if="regoComplete"
            dense inline-actions class="text-white bg-red text-center"
          >
            Please check your inbox for a confirmation email.
            <template v-slot:action>
              <q-btn flat label="Dismiss" @click="regoComplete = false"/>
            </template>
          </q-banner>
        </q-tab-panel>

        <!-- REGISTER -->
        <q-tab-panel name="register">
          <q-input
            v-model="registerModel.email" label="Email" outlined
            :rules="[ val => val && val.length > 0 || 'Please enter an email address']"
          />
          <q-input
            v-model="registerModel.name" label="Full Name" outlined
            :rules="[ val => val && val.length > 0 || 'Please enter your full name']"
          />
          <q-input
            v-model="registerModel.gamertag" label="Gamertag" outlined
            :rules="[ val => val && val.length > 0 || 'Please enter a gamertag']"
          />
          <q-input
            v-model="registerModel.password" type="password" label="Password" outlined
            :rules="[ val => val && val.length > 0 || 'Please enter a password']"
          />
          <q-input
            v-model="passwordCheck" type="password" label="Password Again" outlined
            :rules="[
              val => val && val.length > 0 || 'Please enter a password',
              val => val == registerModel.password || 'The passwords do not match'
            ]"
          />
        </q-tab-panel>
      </q-tab-panels>

      <!-- SUBMIT BUTTON -->
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
  height: auto;
  overflow: hidden;
  width: 500px;
  max-width: 90vw;
  transition: all 0.5s ease-out;
}
.tall {
  height: 515px;
}
.short {
  height: 285px;
}
.medium {
  height: 325px;
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
      passwordCheck: null,
      regoComplete: false,
      registerModel: {
        email: null,
        name: null,
        gamertag: null,
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
          this.loginModel.email = response.data.email;
          this.mode = 'login';
          this.regoComplete = true;
        })
        .catch(() => {
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
          this.$router.push({ path: '/' });
          this.$store.commit('setUser', response.data.user);
          this.$store.commit('setJWTtoken', response.data.token);
          this.$q.cookies.set('fmcar-user', response.data.user, { expires: 3, path: '/' });
          this.$q.cookies.set('fmcar-token', response.data.token, { expires: 3, path: '/' });
        })
        .catch(() => {
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
          && this.registerModel.password != null && this.registerModel.password.length > 0
          && this.passwordCheck != null && this.registerModel.password === this.passwordCheck
          && this.registerModel.gamertag != null && this.registerModel.gamertag.length > 0
          && this.registerModel.name != null && this.registerModel.name.length > 0;
      }
      return false;
    },
  },
};
</script>
