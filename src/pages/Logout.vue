<template>
  <q-page class="flex flex-center" @keyup.enter="authorize">
    <div class="row">
      <div class="col-xs-12 text-center q-my-lg">
        <q-spinner
          color="primary"
          size="10em"
        />
      </div>
      <div class="col-xs-12 text-center q-my-lg">
        Logging you out...
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'Logout',
  created() {
    this.$store.commit('logout');
    this.$q.cookies.remove('fmcar-user');
    this.$q.cookies.remove('fmcar-token');
    setTimeout(() => {
      this.$router.push({ path: '/' });
      this.$q.notify({
        message: 'You are now logged out...',
        color: 'green',
      });
    }, 500);
  },
};
</script>
