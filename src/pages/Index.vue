<template>
  <q-page class="q-px-lg">

    <div class="row q-pt-lg justify-center">
      <div class="text-h3">Forza Motorsport Community Australia</div>
    </div>
    <div class="row q-pt-lg justify-center">
      <img src="../assets/fb-join.png" class="responsive-img">
    </div>

    <div v-if="user">
      <div class="row">
        <div class="col-xs-12">
          <div class="text-h4">Dashboard</div>
          <div class="text-body1">You are logged in as {{ user.name }} ({{ user.email }})</div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="text-body1">You are not logged in...</div>
    </div>

  </q-page>
</template>

<style>
.border {
  border:1px solid black;
}
.responsive-img {
  width:430px;
  height:auto;
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
