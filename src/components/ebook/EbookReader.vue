<template>
  <div class="ebook-reader">
      <div class="ebook-reader-mask"
       @touchmove="move"
       @touchend="moveEnd"
       @click="onMaskClick">
      </div>
      <div class="read-wrapper">
       <div id="read"></div>
      </div>
  </div>
</template>

<script>
  import Epub from 'epubjs'
  import { ebookMixin } from '@/utils/mixin'
  import {
    getTheme,
    getFontFamily,
    saveFontFamily,
    saveTheme,
    getFontSize,
    saveFontSize,
    getLocation
    // saveMetadata,
  } from '../../utils/localStorage'
  global.ePub = Epub
  export default {
    mixins: [ebookMixin],
    computed: {},
    created () {},
    mounted () {
      const url = this.$route.params.fileName.split('$').join('/')
      this.setFileName(url)
      .then(() => {
         this.initEpub()
      })
    },
    methods: {
      initEpub() {
        const url = `${process.env.VUE_APP_EPUB_URL}/${this.fileName}.epub`
        //渲染电子书
        this.book = new Epub(url)
        this.setCurrentBook(this.book)
        this.initRendition()
        this.initGesture()
        this.pareBook()
      },
      initRendition () {
        this.rendition = this.book.renderTo('read', {
          width: window.innerWidth,
          height: window.innerHeight,
          method: 'default'
        })
        const cfi = getLocation(this.fileName)
        //console.log('开头', cfi)
        this.display(cfi, () => {
          this.initTheme()
          this.initFontSize()
          this.initFontFamily()
        })
        this.book.ready.then(() => {
          return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16))
        }).then((locations) => {
          this.refreshLocation()
          this.setBookAvailable(true)
        })
      },
      initGesture() {
        this.rendition.on('touchstart', event => {
          this.touchStartX = event.changedTouches[0].clientX
          this.touchStartTime = event.timeStamp
        })
        this.rendition.on('touchend', event => {
          const offsetX = event.changedTouches[0].clientX - this.touchStartX
          const time = event.timeStamp - this.touchStartTime
          if (time < 500 && offsetX > 40) {
            this.prevPage()
          } else if (time < 500 && offsetX < -40) {
            this.nextPage()
          } else {
            this.showTitleAndMenu()
          }
          //event.preventDefault()
          event.stopPropagation()
        })
      },
      initTheme() {
        //设置默认并缓存默认
        let defaultTheme = getTheme(this.fileName)
        if (!defaultTheme) {
          defaultTheme = this.themeList[0].name
          saveTheme(this.fileName, defaultTheme)
        } else {
          this.setDefaultTheme(defaultTheme)
        }
        //注册皮肤
        this.switchTheme()
      },
      initFontSize() {
        let fontSize = getFontSize(this.fileName)
        if (!fontSize) {
          fontSize = 16
          saveFontSize(this.fileName, fontSize)
        }
        this.setFontSize(fontSize)
        return fontSize
      },
      initFontFamily() {
        let font = getFontFamily(this.fileName)
        if (!font) {
          font = 'Default'
          saveFontFamily(this.fileName, font)
        }
        this.setFontFamily(font)
        return font
      },
      pareBook() {
        //获取图书封面
        this.book.loaded.cover.then(cover => {
          this.book.archive.createUrl(cover).then(url => {
            this.setCover(url)
          })
        })
        //获取图书基本信息
        this.book.loaded.metadata.then(matedata => {
           this.setMetadata(matedata)
        })
        //获取图书目录
        this.book.loaded.navigation.then(nav => {
          const navItem = (function flatten(arr) {
            return [].concat(...arr.map(v => [v, ...flatten(v.subitems)]))
          })(nav.toc)
          function find(item, v = 0) {
            const parent = navItem.filter(it => it.id === item.parent)[0]
            return !item.parent ? v : (parent ? find(parent, ++v) : v)
          }
          navItem.forEach(item => {
            item.level = find(item)
            item.total = 0
            item.pagelist = []
            if (item.href.match(/^(.*)\.html$/)) {
              item.idhref = item.href.match(/^(.*)\.html$/)[1]
            } else if (item.href.match(/^(.*)\.xhtml$/)) {
              item.idhref = item.href.match(/^(.*)\.xhtml$/)[1]
            }
          })
          this.setNavigation(navItem)
          this.setIsPaginating(false)
        })
      },
      onMaskClick(e) {
        if (this.mouseMove === 2) {
        } else if (this.mouseMove === 1 || this.mouseMove === 4) {
          const offsetX = e.offsetX
          const width = window.innerWidth
          if (offsetX > 0 && offsetX < width * 0.3) {
            this.prevPage()
          } else if (offsetX > 0 && offsetX > width * 0.7) {
            this.nextPage()
          } else {
            this.toggleMenuVisible()
          }
        }
        this.mouseMove = 4
      },
      move(e) {
        let offsetY = 0
        if (this.firstOffsetY) {
          offsetY = e.changedTouches[0].clientY - this.firstOffsetY
          this.$store.commit('SET_OFFSETY', offsetY)
        } else {
          this.firstOffsetY = e.changedTouches[0].clientY
        }
        e.preventDefault()
        e.stopPropagation()
      },
      moveEnd() {
        this.$store.dispatch('setOffsetY', 0)
        this.firstOffsetY = 0
      },
      prevPage() {
        if (this.rendition) {
          this.rendition.prev()
          this.refreshLocation()
        }
        this.hideMenuVisible()
      },
      nextPage() {
        if (this.rendition) {
          this.rendition.next()
          this.refreshLocation()
        }
        this.hideMenuVisible()
      }
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
