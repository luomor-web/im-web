/* istanbul ignore next */

import Vue from 'vue'

const isServer = Vue.prototype.$isServer
const SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/
const ieVersion = isServer ? 0 : Number(document.documentMode)

/* istanbul ignore next */
const trim = function (string) {
    return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}
/* istanbul ignore next */
const camelCase = function (name) {
    return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter
    }).replace(MOZ_HACK_REGEXP, 'Moz$1')
}

/* istanbul ignore next */
export const on = (function () {
    if (!isServer && document.addEventListener) {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.addEventListener(event, handler, false)
            }
        }
    } else {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.attachEvent('on' + event, handler)
            }
        }
    }
})()

/* istanbul ignore next */
export const off = (function () {
    if (!isServer && document.removeEventListener) {
        return function (element, event, handler) {
            if (element && event) {
                element.removeEventListener(event, handler, false)
            }
        }
    } else {
        return function (element, event, handler) {
            if (element && event) {
                element.detachEvent('on' + event, handler)
            }
        }
    }
})()

/* istanbul ignore next */
export const once = function (el, event, fn) {
  const listener = function () {
    if (fn) {
      fn.apply(this, arguments)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

/* istanbul ignore next */
export function hasClass (el, cls) {
    if (!el || !cls) return false
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
    if (el.classList) {
        return el.classList.contains(cls)
    } else {
        return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
    }
}

/* istanbul ignore next */
export function addClass (el, cls) {
    if (!el) return
    let curClass = el.className
    const classes = (cls || '').split(' ')

    let i = 0
    const j = classes.length
    for (; i < j; i++) {
        const clsName = classes[i]
        if (!clsName) continue

        if (el.classList) {
            el.classList.add(clsName)
        } else if (!hasClass(el, clsName)) {
            curClass += ' ' + clsName
        }
    }
    if (!el.classList) {
        el.setAttribute('class', curClass)
    }
}

/* istanbul ignore next */
export function removeClass (el, cls) {
    if (!el || !cls) return
    const classes = cls.split(' ')
    let curClass = ' ' + el.className + ' '

    for (let i = 0, j = classes.length; i < j; i++) {
        const clsName = classes[i]
        if (!clsName) continue

        if (el.classList) {
            el.classList.remove(clsName)
        } else if (hasClass(el, clsName)) {
            curClass = curClass.replace(' ' + clsName + ' ', ' ')
        }
    }
    if (!el.classList) {
        el.setAttribute('class', trim(curClass))
    }
}

/* istanbul ignore next */
export const getStyle = ieVersion < 9
    ? function (element, styleName) {
        if (isServer) return
        if (!element || !styleName) return null
        styleName = camelCase(styleName)
        if (styleName === 'float') {
            styleName = 'styleFloat'
        }
        try {
            switch (styleName) {
                case 'opacity':
                    try {
                        return element.filters.item('alpha').opacity / 100
                    } catch (e) {
                        return 1.0
                    }
                default:
                    return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null)
            }
        } catch (e) {
            return element.style[styleName]
        }
    }
    : function (element, styleName) {
        if (isServer) return
        if (!element || !styleName) return null
        styleName = camelCase(styleName)
        if (styleName === 'float') {
            styleName = 'cssFloat'
        }
        try {
            const computed = document.defaultView.getComputedStyle(element, '')
            return element.style[styleName] || computed ? computed[styleName] : null
        } catch (e) {
            return element.style[styleName]
        }
    }

export const isScroll = (el, vertical) => {
    if (isServer) return

    const determinedDirection = vertical !== null && vertical !== undefined
    const overflow = determinedDirection
        ? vertical
            ? getStyle(el, 'overflow-y')
            : getStyle(el, 'overflow-x')
        : getStyle(el, 'overflow')

    return overflow.match(/(scroll|auto|overlay)/)
}

export const getScrollContainer = (el, vertical) => {
    if (isServer) return

    let parent = el
    while (parent) {
        if ([window, document, document.documentElement].includes(parent)) {
            return window
        }
        if (isScroll(parent, vertical)) {
            return parent
        }
        parent = parent.parentNode
    }

    return parent
}

export const isInContainer = (el, container) => {
    if (isServer || !el || !container) return false

    const elRect = el.getBoundingClientRect()
    let containerRect

    if ([window, document, document.documentElement, null, undefined].includes(container)) {
        containerRect = {
            top: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
            left: 0
        }
    } else {
        containerRect = container.getBoundingClientRect()
    }

    return elRect.top < containerRect.bottom &&
        elRect.bottom > containerRect.top &&
        elRect.right > containerRect.left &&
        elRect.left < containerRect.right
}

export const scrollToView = (el) => {
    if (!el) return

    // element.parentNode.scrollTop = element.offsetTop
    el.parentNode.scrollTop = el.offsetTop - 30
    // element.scroll({top: element.offsetTop, behavior: 'smooth'})

    el.style.transition = 'background-color .5s ease-in-out'
    el.style.backgroundColor = '#dfe1e5'
    el.style.borderRadius = '8px'

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

    setTimeout(() => {
        el.style.transition = 'background-color .5s ease-in-out'
        el.style.borderRadius = '8px'
        el.style.backgroundColor = ''
    }, 500)
}

export const scrollToTop = (el) => {
    if (!el) return
    el.scrollTop = 0
}
