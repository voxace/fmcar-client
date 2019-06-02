<template>
  <q-page class="flex flex-center">
    <div class="row" v-if="verifying && !error">
      <div class="col-xs-12 text-center q-my-lg">
        <q-spinner
          color="primary"
          size="10em"
        />
      </div>
      <div class="col-xs-12 text-center q-my-lg">
        <p>Verifying your email...</p>
      </div>
    </div>
    <div class="row" v-if="!verifying && !error">
      <div class="col-xs-12 text-center q-my-lg">
        <p>Thankyou for verifying your email.</p>
      </div>
    </div>
    <div class="row" v-if="error">
      <q-banner dense inline-actions class="text-white bg-red">
        Something went wrong. You might already be verified. try logging in.
        <template v-slot:action>
          <q-btn flat color="white" label="Go to login" @click="redirect"/>
        </template>
      </q-banner>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'Verify',
  data() {
    return {
      verifying: true,
      error: false,
    };
  },
  mounted() {
    this.verify();
  },
  methods: {
    async verify() {
      await this.$axios
        .post('/auth/verify', { token: this.$route.params.token })
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'fas fa-check-circle',
            message: 'Email address verified successfully!',
          });
          this.verifying = false;
          setTimeout(() => {
            this.$router.push({ path: '/login' });
          }, 3000);
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error verifying email address!',
          });
        });
      this.error = true;
    },
    redirect() {
      this.$router.push({ path: '/login' });
    },
  },
};
</script>
