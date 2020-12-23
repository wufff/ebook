<template>
  <div class="ebook-reader">
    {{$route.params.fileName}}
  </div>
</template>

<script>
  export default {
    created () {
      console.log(123)
      const route = this.$route
      console.log(route)
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .ebook-reader {
    width: 100%;
    height: 100%;
    overflow: hidden;
    .ebook-reader-mask {
      position: absolute;
      z-index: 150;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
</style>
