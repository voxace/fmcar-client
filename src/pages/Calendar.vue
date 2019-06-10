<template>
  <q-page>
    <div class="row q-px-lg">
      <div class="col-xs-12 q-pt-md">
        <iframe
          src="https://calendar.google.com/calendar/embed?src=gkfg1pnajgfis733eb0ue550vc%40group.calendar.google.com&amp;ctz=Australia%2FBrisbane"
          style="border: 0" width="100%" height="850" frameborder="0" scrolling="no">
        </iframe>
      </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'Calendar',
  meta: {
    title: 'Home',
    titleTemplate: title => `FMCAR - ${title}`,
    meta: {
      description: { name: 'FMCAR Calendar', content: 'Calendar' },
      keywords: { name: 'fmcar forza xbox racing', content: 'FMCAR' },
      equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
    },
  },
};
</script>
