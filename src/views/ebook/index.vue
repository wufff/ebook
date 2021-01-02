<template>
  <div class="ebook">
     <ebook-title></ebook-title>
     <ebook-reader></ebook-reader>
     <ebook-menu></ebook-menu>
  </div>
</template>

<script>
  import EbookReader from '../../components/ebook/EbookReader'
  import EbookTitle from '../../components/ebook/EbookTitle'
  import EbookMenu from '@/components/ebook/EbookMenu'
  import { ebookMixin } from '../../utils/mixin'
  import { getReadTime, saveReadTime } from '../../utils/localStorage'
  export default {
    mixins: [ebookMixin],
    name: 'index',
    mounted() {
      this.startLoopReadTime()
    },
    beforeDestroy() {
      if (this.task) {
        clearInterval(this.task)
      }
    },
    methods: {
      startLoopReadTime() {
        let readTime = getReadTime(this.fileName)
        if (!readTime) {
          readTime = 0
        }
        this.task = setInterval(() => {
          readTime++
          if (readTime % 30 === 0) {
            saveReadTime(this.fileName, readTime)
          }
        }, 1000)
      }
    },
    components: {
      EbookReader,
      EbookTitle,
      EbookMenu
    }
  }
</script>

<style scoped>

</style>
