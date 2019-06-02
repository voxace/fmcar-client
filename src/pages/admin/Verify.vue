<template>
  <q-page class="flex flex-center">
    <div class="row" v-if="verifying">
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
    <div class="row" v-else>
      <div class="col-xs-12 text-center q-my-lg">
        <p>Thankyou for verifying your email.</p>
        <p>This window will now close...</p>
      </div>
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
          setTimeout(() => {
            window.close();
          }, 5000);
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-4',
            textColor: 'white',
            icon: 'fas fa-cross-circle',
            message: 'Error verifying email address!',
          });
        });
    },
  },
};
</script>
