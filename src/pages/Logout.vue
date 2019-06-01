<template>
  <q-page class="flex flex-center" @keyup.enter="authorize">
    <q-spinner
      color="primary"
      size="3em"
    />
  </q-page>
</template>

<script>
export default {
  name: 'Logout',
  created() {
    this.$store.commit('logout');
    this.$q.cookies.remove('fmcar-user');
    this.$q.cookies.remove('fmcar-token');
    this.$router.push({ path: '/' });
    this.$q.notify({
      message: 'You are now logged out...',
      color: 'green',
    });
  },
};
</script>
