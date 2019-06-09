<template>
  <q-page>
    <div class="row q-px-lg">
      <div class="col-xs-12">
      <img class="row justify-center" src="../assets/fb-join.png">
      <h3>Forza Motorsport Community Australia</h3>
      <p v-if="user">You are logged in as {{ user.name }} ({{ user.email }})</p>
      <p v-else>You are not logged in...</p>
      </div>
    </div>
  </q-page>
</template>

<style>
.fb {
  width:430px;
}
</style>

<script>
export default {
  name: 'Home',
  meta: {
    title: 'Home',
    titleTemplate: title => `FMCAR - ${title}`,
    meta: {
      description: { name: 'FMCAR Home', content: 'Home' },
      keywords: { name: 'fmcar forza xbox racing', content: 'FMCAR' },
      equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
    },
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
};
</script>
