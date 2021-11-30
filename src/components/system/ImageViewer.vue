<template>
  <transition name="viewer-fade">
    <div tabindex="-1" ref="imageViewerWrapper" class="image-viewer__wrapper" :style="{ 'z-index': zIndex }">
      <div class="mask" @click.self="handleMaskClick"></div>
      <!-- CLOSE -->
      <span class="btn close" @click="hide">
        <v-icon color="white">{{ icons.mdiClose }}</v-icon>
      </span>
      <!-- ARROW -->
      <template v-if="!isSingle">
        <span
            class="btn prev"
            :class="{ 'is-disabled': !infinite && isFirst }"
            @click="prev">
          <v-icon color="white">{{ icons.mdiChevronLeft }}</v-icon>
        </span>
        <span
            class="btn next"
            :class="{ 'is-disabled': !infinite && isLast }"
            @click="next">
          <v-icon color="white">{{ icons.mdiChevronRight }}</v-icon>
        </span>
      </template>
      <!-- ACTIONS -->
      <div class="btn actions">
        <div class="inner">
          <span @click="handleActions('zoomOut')">
            <v-icon color="white">{{ icons.mdiMinus }}</v-icon>
          </span>
          <span @click="handleActions('zoomIn')">
            <v-icon color="white">{{ icons.mdiPlus }}</v-icon>
          </span>
          <span @click="toggleMode"><v-icon color="white">{{ mode.icon }}</v-icon></span>
          <span @click="handleActions('anticlocelise')">
            <v-icon color="white"> {{ icons.mdiRotateLeft }} </v-icon>
          </span>
          <span @click="handleActions('clocelise')">
            <v-icon color="white">{{ icons.mdiRotateRight }}</v-icon>
          </span>
        </div>
      </div>
      <!-- CANVAS -->
      <div class="canvas">
        <template v-for="(url, i) in urlList">
          <img
              v-if="i === index"
              ref="img"
              class="img"
              :key="url"
              :src="currentImg"
              :style="imgStyle"
              @load="handleImgLoad"
              @error="handleImgError"
              @mousedown="handleMouseDown" alt="">
        </template>

      </div>
    </div>
  </transition>
</template>

<script>
import {off, on} from "@/utils/dom";
import {onMounted, computed, ref} from "@vue/composition-api";
import {isFirefox, rafThrottle} from "@/utils/util";
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiCloseCircle,
  mdiFullscreen, mdiFullscreenExit,
  mdiMagnifyMinusOutline,
  mdiMagnifyPlusOutline,
  mdiMinus,
  mdiPlus, mdiRotateLeft, mdiRotateRight
} from "@mdi/js";

const Mode = {
  CONTAIN: {
    name: 'contain',
    icon: mdiFullscreen
  },
  ORIGINAL: {
    name: 'original',
    icon: mdiFullscreenExit
  }
};

export default {
  name: "ImageViewer",
  props: {
    urlList: {
      type: Array,
      default: () => []
    },
    zIndex: {
      type: Number,
      default: 2000
    },
    onSwitch: {
      type: Function,
      default: () => {
      }
    },
    onClose: {
      type: Function,
      default: () => {
      }
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
    maskClosable: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    const _keyDownHandler = ref(null)
    const _mouseWheelHandler = ref(null)
    const _dragHandler = ref(null)
    const mousewheelEventName = ref(isFirefox() ? 'DOMMouseScroll' : 'mousewheel')
    const infinite = ref(false)
    const index = ref(0)
    const loading = ref(false)
    const mode = ref(Mode.CONTAIN)
    const imageViewerWrapper = ref(null)

    const transform = ref({
      scale: 1,
      deg: 0,
      offsetX: 0,
      offsetY: 0,
      enableTransition: false
    })

    const isSingle = computed(() => {
      return props.urlList.length <= 1;
    })
    const isFirst = computed(() => {
      return index.value === 0;
    })
    const isLast = computed(() => {
      return index.value === props.urlList.length - 1;
    })
    const currentImg = computed(() => {
      return props.urlList[index.value];
    })

    const imgStyle = computed(() => {
      const {scale, deg, offsetX, offsetY, enableTransition} = transform.value;
      const style = {
        transform: `scale(${scale}) rotate(${deg}deg)`,
        transition: enableTransition ? 'transform .3s' : '',
        'margin-left': `${offsetX}px`,
        'margin-top': `${offsetY}px`
      }
      if (mode.value === Mode.CONTAIN) {
        style.maxWidth = style.maxHeight = '100%';
      }
      return style;
    })

    const prev = () => {
      if (isFirst.value && !infinite.value) return;
      const len = props.urlList.length;
      index.value = (index.value - 1 + len) % len;
    }

    const next = () => {
      if (isLast.value && !infinite.value) return;
      const len = props.urlList.length;
      index.value = (index.value + 1) % len;
    }

    const handleActions = (action, options = {}) => {
      if (loading.value) return;
      const {zoomRate, rotateDeg, enableTransition} = {
        zoomRate: 0.2,
        rotateDeg: 90,
        enableTransition: true,
        ...options
      }

      switch (action) {
        case 'zoomOut':
          if (transform.value.scale > 0.2) {
            transform.value.scale = parseFloat((transform.value.scale - zoomRate).toFixed(3));
          }
          break;
        case 'zoomIn':
          transform.value.scale = parseFloat((transform.value.scale + zoomRate).toFixed(3));
          break;
        case 'clocelise':
          transform.value.deg += rotateDeg;
          break;
        case 'anticlocelise':
          transform.value.deg -= rotateDeg;
          break;
      }
      transform.value.enableTransition = enableTransition;
    }

    const handleMaskClick = () => {
      if (props.maskClosable) {
        hide()
      }
    }

    const hide = () => {
      deviceSupportUninstall()
      props.onClose()
    }

    const deviceSupportUninstall = () => {
      off(document, 'keydown', _keyDownHandler.value);
      off(document, mousewheelEventName.value, _mouseWheelHandler.value);
      _keyDownHandler.value = null;
      _mouseWheelHandler.value = null;
    }

    const toggleMode = () => {
      if (loading.value) return;

      const modeNames = Object.keys(Mode);
      const modeValues = Object.values(Mode);
      const index = modeValues.indexOf(mode.value);
      const nextIndex = (index + 1) % modeNames.length;
      mode.value = Mode[modeNames[nextIndex]];
      reset()
    }

    const reset = () => {
      transform.value = {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false
      }
    }

    const handleImgLoad = () => {
      loading.value = false
    }

    const handleImgError = (e) => {
      loading.value = false
      e.target.alt = '加载失败';
    }

    const handleMouseDown = (e) => {
      if (loading.value || e.button !== 0) return

      const {offsetX, offsetY} = transform.value;
      const startX = e.pageX;
      const startY = e.pageY;

      _dragHandler.value = rafThrottle(ev => {
        transform.value.offsetX = offsetX + ev.pageX - startX;
        transform.value.offsetY = offsetY + ev.pageY - startY;
      });

      on(document, 'mousemove', _dragHandler.value);
      on(document, 'mouseup', () => {
        off(document, 'mousemove', _dragHandler.value);
      });

      e.preventDefault();
    }

    const deviceSupportInstall = () => {

      _keyDownHandler.value = e => {
        e.stopPropagation();
        const keyCode = e.keyCode;
        switch (keyCode) {
            // ESC
          case 27:
            hide();
            break;
            // SPACE
          case 32:
            toggleMode();
            break;
            // LEFT_ARROW
          case 37:
            prev();
            break;
            // UP_ARROW
          case 38:
            handleActions('zoomIn');
            break;
            // RIGHT_ARROW
          case 39:
            next();
            break;
            // DOWN_ARROW
          case 40:
            handleActions('zoomOut');
            break;
        }
      }

      _mouseWheelHandler.value = rafThrottle(e => {
        const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
        if (delta > 0) {
          handleActions('zoomIn', {
            zoomRate: 0.015,
            enableTransition: false
          });
        } else {
          handleActions('zoomOut', {
            zoomRate: 0.015,
            enableTransition: false
          });
        }
      });
      on(document, 'keydown', _keyDownHandler.value);
      on(document, mousewheelEventName.value, _mouseWheelHandler.value);
    }

    onMounted(() => {
      deviceSupportInstall()

      imageViewerWrapper.value.focus()
    })

    return {
      index,
      mode,
      infinite,
      isSingle,
      isFirst,
      isLast,
      currentImg,
      imgStyle,
      imageViewerWrapper,

      handleMouseDown,
      handleImgLoad,
      handleImgError,
      toggleMode,
      handleActions,
      prev,
      next,
      hide,
      handleMaskClick,

      icons: {
        mdiCloseCircle,
        mdiClose,
        mdiMagnifyPlusOutline,
        mdiMagnifyMinusOutline,
        mdiPlus,
        mdiMinus,
        mdiFullscreen,
        mdiFullscreenExit,
        mdiRotateLeft,
        mdiRotateRight,
        mdiChevronRight,
        mdiChevronLeft
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.image-viewer__wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  .mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: .5;
    background: #000;
  }

  .btn {
    position: absolute;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    opacity: .8;
    cursor: pointer;
    box-sizing: border-box;
    user-select: none;
  }

  .close {
    top: 40px;
    right: 40px;
    width: 40px;
    height: 40px;
    font-size: 24px;
    color: #fff;
    background-color: #606266;
  }

  .prev {
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    font-size: 24px;
    color: #fff;
    background-color: #606266;
    border-color: #fff;
    left: 40px;
  }

  .next {
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    font-size: 24px;
    color: #fff;
    background-color: #606266;
    border-color: #fff;
    right: 40px;
    text-indent: 2px;
  }

  .mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: .5;
    background: #000;
  }

  .actions {
    left: 50%;
    bottom: 30px;
    transform: translateX(-50%);
    width: 282px;
    height: 44px;
    padding: 0 23px;
    background-color: #606266;
    border-color: #fff;
    border-radius: 22px;

    .inner {
      width: 100%;
      height: 100%;
      text-align: justify;
      cursor: default;
      font-size: 23px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
  }

  .canvas {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

}

.viewer-fade-enter-active {
  animation: viewer-fade-in .3s;
}

.viewer-fade-leave-active {
  animation: viewer-fade-out .3s;
}

@keyframes viewer-fade-in {
  0% {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes viewer-fade-out {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }
}
</style>