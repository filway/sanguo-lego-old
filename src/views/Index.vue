/* eslint-disable prettier/prettier */
<template>
  <div class="homepage-container" :style="{ background: '#f8f8f8' }">
    <preview-dialog @close="closePreviewDialog" :show="showPreview" :logoId="currentId" :previewData="previewData"
      @clickDownload="openDownloadDialog"></preview-dialog>
    <van-row class="logoTips">
      <van-col span="24">Logo结果选择</van-col>
    </van-row>
    <van-loading class="loadingBox" v-if="isLoading" style="text-align: center" size="24px" vertical
      color="#fff">Logo生成中...</van-loading>
    <div v-show="!isLoading" class="page">
      <div class="logo-desc" v-show="currentPage === 0">
        {{ title }}
      </div>
      <div @click="openPreviewDialog(logo.materialId, logo.randomIndex, key)" v-for="(logo, key) in logoList" :key="key"
        class="card-box" v-show="currentPage === key">
        <div class="logo-box">
          <component baseProfile="full" :is="'svg'" version="1.1" :class="'svg' + key" viewBox="0 0 686 380.78"
            xmlns="http://www.w3.org/2000/svg" />
        </div>
        <div class="text-box animate__animated animate__bounce">点击选择此方案</div>
      </div>
      <p v-show="logoList[currentPage] && logoList[currentPage].design" class="page-t">设计理念</p>
      <div v-show="logoList[currentPage] && logoList[currentPage].design" class="ll-box">
        <p class="page-p">{{ logoList[currentPage] ? logoList[currentPage].design : "" }}</p>
      </div>
      <div class="page-screen" v-for="(logo, key) in logoList" :key="key" v-show="currentPage === key">
        <div :class="`page-bg page-bg-01 page-bg-img page-insert-${key}`" :style="`background-image: url(` +
          require(`../assets/img/cj2/${logo.imgIndex}/1.jpg`) +
          `)`
          "></div>
        <div class="page-bg page-bg-02">
          <div :class="`page-bg-img page-bg-02-left page-insert-${key}`" :style="`background-image: url(` +
            require(`../assets/img/cj2/${logo.imgIndex}/2.jpg`) +
            `)`
            "></div>
          <div class="page-bg-02-right">
            <div :class="`page-bg-img page-insert-${key}`" :style="`background-color: #7F7F81`"></div>
            <div :class="`page-bg-img page-insert-${key}`" :style="`background-color: #B2B2B2`"></div>
          </div>
        </div>
        <div :class="`page-bg page-bg-04 page-bg-img page-insert-${key}`" :style="`background-image: url(` +
          require(`../assets/img/cj2/${logo.imgIndex}/6.jpg`) +
          `)`
          "></div>
        <div :class="`page-bg page-bg-07 page-bg-img page-insert-${key}`"
          :style="`background-image: url(` + require(`../assets/img/cj/show3.png`) + `)`"></div>
        <div :class="`page-bg page-bg-05 page-bg-img page-insert-${key}`" :style="`background-image: url(` +
          require(`../assets/img/cj2/${logo.imgIndex}/7.jpg`) +
          `);height: 100vw`
          "></div>
        <div :class="`page-bg page-bg-06 page-bg-img page-insert-${key}`" :style="`background-image: url(` +
          require(`../assets/img/cj2/${logo.imgIndex}/8.jpg`) +
          `);height: 80vw`
          "></div>
      </div>
    </div>

    <div v-show="!isLoading" class="tipsBox">
      <p class="tips-title">温馨提示:</p>
      <p>
        {{ tips }}
      </p>
    </div>

    <div class="pageBox" v-show="!isLoading">
      <div class="pagenation-big" v-show="currentPage === 0" @click="nextPage()">下一款方案</div>
      <div class="pagenation-small-box">
        <div class="pagenation-small" v-show="currentPage > 0 && currentPage < logoList.length - 1" @click="prevPage()">
          上一款方案
        </div>
        <div class="pagenation-small" v-show="currentPage > 0 && currentPage < logoList.length - 1" @click="nextPage()">
          下一款方案
        </div>
      </div>
      <div class="pagenation-big" v-show="currentPage === logoList.length - 1" @click="prevPage()">
        上一款方案
      </div>
    </div>

    <span v-html="cp"></span>
    <!-- 免责声明弹窗 -->
    <van-dialog v-if="free_statement && free_statement.length > 0" v-model:show="isShowFreeStatement"
      class="freeStatementDialog" theme="round-button" :confirm-button-text="confirmText" width="90%"
      transition="bounce" :confirm-button-color="confirmTextColor" :before-close="onCloseFreeStatementDialog">
      <div v-html="free_statement" class="content-box"></div>
    </van-dialog>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, provide, ref } from 'vue'
import { GlobalDataProps } from '../store/index'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import useCreateLogo from '@/hooks/useCreateLogo'
import PreviewDialog from '@/components/PreviewDialog.vue'
import { SVG } from '@svgdotjs/svg.js'
import { previewPropsArr } from '../constants/preview.constant'
import { getSvgHtml, toTop, preloadFont } from '@/helper'
import cheerio from 'cheerio'
import $ from 'jquery'

export default defineComponent({
  name: 'Index',
  components: {
    PreviewDialog,
  },
  setup() {
    const showPreview = ref(false)
    const isLoading = computed(() => store.getters.isLoading)
    const route = useRoute()
    const currentId = ref(0)
    const currentIndex = ref(0)
    const store = useStore<GlobalDataProps>()
    const currentPage = ref(0)

    const logoList = computed(() => store.state.templates.data)
    const cp = computed(() => store.state.templates.cp)
    const title = computed(() => store.state.templates.title)
    const tips = computed(() => store.state.templates.tips)

    /* 免责声明相关 start */
    const free_statement = computed(() => store.state.templates.free_statement)
    const isShowFreeStatement = ref(false)
    // 判断如果有免责声明，就启动一个3s的倒计时, 倒计时结束之后才能点击确定
    const confirmTextColor = ref('#ccc')
    const count = ref(3)
    const confirmText = computed(() => count.value === 0 ? '我已知晓' : `我已知晓(${count.value}s)`)
    /* 免责声明相关 end */

    provide('key', currentIndex)

    const previewData = ref<any[]>([])

    const imgBase64 = ref('')
    const openPreviewDialog = (id: number, index: number, key: number) => {
      currentId.value = id
      currentIndex.value = key
      let svgObj = SVG(`.svg${key}`)
      svgObj.node.removeAttribute('xmlns:svgjs')
      svgObj.node.removeAttribute('svgjs:data')
      const svg1 = svgObj.svg()
      //替换掉svgjs:data，否则图片加载不出
      const p2 = /svgjs:data\s*?=\s*?([‘"])[\s\S]*?\1/g
      const svg = svg1.replace(p2, '')
      previewData.value = []
      previewPropsArr.forEach(item => {
        const img_w = item.w
        const img_h = item.h
        const $ = cheerio.load(svg, { xml: true })
        const left = item.x
        const top = item.y
        const rotate = `rotate(${item.r}deg)`
        $('svg').css('position', 'absolute')
        $('svg').css('width', img_w.toString() + 'px')
        $('svg').css('height', img_h.toString() + 'px')
        $('svg').css('left', left.toString() + 'px')
        $('svg').css('top', top.toString() + 'px')
        $('svg').css('transform', rotate)
        previewData.value.push({
          url: item.url,
          svg: $.html(),
        })
      })

      showPreview.value = true
    }
    const closePreviewDialog = () => {
      showPreview.value = false
    }
    const openDownloadDialog = () => {
      console.log('跳转下载')
    }
    const nextPage = () => {
      if (currentPage.value === logoList.value.length - 1) {
        return
      }
      currentPage.value = currentPage.value + 1
      toTop()
    }
    const prevPage = () => {
      if (currentPage.value === 0) {
        return
      }
      currentPage.value = currentPage.value - 1
      toTop()
    }

    const onCloseFreeStatementDialog = (action: string) =>
      new Promise(resolve => {
        // 判断count
        if (count.value === 0) {
          resolve(true)
        } else {
          resolve(false)
        }
      })

    onMounted(async () => {
      let { sn } = route.query
      localStorage.setItem('sn', sn as string)
      //获取logo list
      await store.dispatch('fetchTemplates', {
        data: { sn: sn || '' },
      })

      // 提前请求后端接口拿到横版和竖版列表字体的base64, 然后引入到head标签里面的style里面
      const firstItem = logoList.value[0]
      await preloadFont(firstItem.font_l, firstItem.font_v, firstItem.name, firstItem.name_en);

      await useCreateLogo(logoList.value)

      const svgHtmlArr = getSvgHtml(logoList.value)
      svgHtmlArr.forEach((item, index) => {
        for (let k = 0; k < 9; k++) {
          $('.page-screen').eq(index).find('.page-bg-img').eq(k).html(item[k])
        }
      })

      if (free_statement.value && free_statement.value.length > 0) {
        isShowFreeStatement.value = true
        const timer = setInterval(() => {
          count.value--
          if (count.value === 0) {
            confirmTextColor.value = '#ee0a24'
            clearInterval(timer)
          }
        }, 1000)
      }
    })

    return {
      logoList,
      showPreview,
      openPreviewDialog,
      closePreviewDialog,
      currentId,
      currentIndex,
      openDownloadDialog,
      isLoading,
      previewData,
      imgBase64,
      cp,
      currentPage,
      nextPage,
      prevPage,
      title,
      tips,
      free_statement,
      isShowFreeStatement,
      confirmTextColor,
      confirmText,
      onCloseFreeStatementDialog,
    }
  },
})
</script>

<style scoped lang="scss">
.homepage-container {
  .logoTips {
    margin-bottom: 1rem;
    font-weight: 300;
    font-size: 14px;
  }

  .loadingBox {
    text-align: center;
    height: 12rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    opacity: 0.7;
    color: #fff;
    border-radius: 5px;
  }

  .page-t {
    margin: 0.5rem 0 0 0;
    font-size: 5.333vw;
    text-align: center;
    margin-top: 1rem;
  }

  .ll-box {
    margin-top: 0.5rem;
    text-align: center;
    display: flex;
    background: #fff;
    color: #000;
    border-radius: 8px;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1.8rem 0 1.8rem;

    .page-p {
      opacity: 0.7;
      font-size: 15px;
      line-height: 1.8;
      font-weight: 300;
      margin-top: 0.2rem;
      text-align: left;
    }
  }

  .pageBox {
    text-align: center;
    display: flex;
    color: #000;
    border-radius: 8px;
    flex-direction: column;
    align-items: center;
    padding: 0 1.8rem;
    margin-top: 1rem;
    position: sticky;
    bottom: 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);

    .pagenation-big {
      background-color: #0201fd;
      color: #fff;
      padding: 3px 6px;
      width: 100px;
      height: 35px;
      line-height: 35px;
      border-radius: 5px;
      margin-bottom: 0.5rem;
      cursor: pointer;
    }

    .pagenation-small-box {
      width: 300px;
      display: flex;
      justify-content: space-evenly;

      .pagenation-small {
        background-color: #0201fd;
        color: #fff;
        padding: 3px 6px;
        width: 100px;
        height: 35px;
        line-height: 35px;
        border-radius: 5px;
        margin-bottom: 0.5rem;
        cursor: pointer;
      }
    }

    // background: url("../assets/img/img_banner.jpg");
  }

  .tipsBox {
    display: flex;
    border-radius: 8px;
    flex-direction: column;
    padding: 0 0.8rem;
    margin-top: 1rem;
    margin-bottom: 0.4rem;

    .tips-title {
      margin-bottom: 0;
    }

    p {
      font-size: 15px;
    }

    color: #fff;
    background: #ff9900;
  }

  min-height: 100vh;
  padding: 0.5rem 1rem;

  .logo-desc {
    color: #fff;
    background-color: #0201fd;
    padding: 14px;
    font-size: 14px;
    height: 54px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .page-title {
    font-size: 5.333vw;
    text-align: center;
    margin: 0.8rem 0;
  }

  .page-screen {

    // animation: zoomIn; /* referring directly to the animation's @keyframe declaration */
    // animation-duration: 2s; /* don't forget to set a duration! */
    img {
      width: 100%;
      height: 100%;
    }

    .page-bg {
      height: 56vw;
    }

    .page-bg-img {
      background-size: 100% 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .page-bg-02 {
      display: flex;

      .page-bg-02-left {
        width: 50%;
      }

      .page-bg-02-right {
        width: 50%;

        div {
          width: 100%;
          height: 50%;
        }
      }
    }
  }

  .card-box {
    display: flex;
    flex-direction: column;
    width: calc(100vw - 2rem);
    height: 14rem;
    background: #fff;
    border: 3px solid #9d9d9d;
    border-radius: 8px;
    animation: zoomIn;
    /* referring directly to the animation's @keyframe declaration */
    animation-duration: 1s;

    /* don't forget to set a duration! */
    .logo-box {
      height: 85%;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .text-box {
      text-align: center;
      color: #d9d9d9;
      font-size: 14px;
    }
  }

  .freeStatementDialog {
    .content-box {
      max-height: 500px;
      overflow-y: auto;
      padding: 1rem;
    }
  }
}
</style>
