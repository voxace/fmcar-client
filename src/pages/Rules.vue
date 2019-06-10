<template>
  <div style="padding:15px;">
    <iframe
      src="https://docs.google.com/document/u/1/d/e/2PACX-1vRdC0vQmwe4pG-vo4t_PyUtNQ-v12cTNtsMzeoDDpfK4CfeVlnKj8QZ7oXdvDSzIs2vczzCexEO2WWY/pub"
      frameborder="0" scrolling="yes" class="iframe-style" width="100%">
    </iframe>
  </div>
</template>

<style>
.iframe-style {
  height: calc(99vh - 90px);
}
</style>

<script>
export default {
  name: 'Rules',
  meta: {
    title: 'Rules',
    titleTemplate: title => `FMCAR - ${title}`,
    meta: {
      description: { name: 'FMCAR Rules', content: 'Rules' },
      keywords: { name: 'fmcar forza xbox racing', content: 'FMCAR' },
      equiv: { 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
    },
  },
};
</script>
