const Vue = require('vue')
const api = require('../src')

api.install(Vue)

function prepare (id, Comp) {
  api.createRecord(id, Comp)
  return new Vue({
    render: h => h(Comp)
  })
}

const id0 = 'rerender: mounted'
test(id0, done => {
  const app = prepare(id0, {
    render: h => h('div', 'foo')
  }).$mount()
  expect(app.$el.textContent).toBe('foo')

  // rerender
  api.rerender(id0, {
    render: h => h('div', 'bar')
  })
  Vue.nextTick(() => {
    expect(app.$el.textContent).toBe('bar')
    done()
  })
})

const id1 = 'reload: mounted'
test(id1, done => {
  let count = 0
  const app = prepare(id1, {
    created () {
      count++
    },
    destroyed () {
      count--
    },
    data: () => ({ msg: 'foo' }),
    render (h) {
      return h('div', this.msg)
    }
  }).$mount()
  expect(app.$el.textContent).toBe('foo')
  expect(count).toBe(1)

  // reload
  api.reload(id1, {
    created () {
      count--
    },
    data: () => ({ msg: 'bar' }),
    render (h) {
      return h('div', this.msg)
    }
  })
  Vue.nextTick(() => {
    expect(app.$el.textContent).toBe('bar')
    expect(count).toBe(-1)
    done()
  })
})

const id2 = 'rerender: updated before mount'
test(id2, done => {
  const app = prepare(id2, {
    render: h => h('div', 'foo')
  })

  // rerender before mount
  api.rerender(id2, {
    render: h => h('div', 'bar')
  })

  app.$mount()
  expect(app.$el.textContent).toBe('bar')

  api.rerender(id2, {
    render: h => h('div', 'baz')
  })
  Vue.nextTick(() => {
    expect(app.$el.textContent).toBe('baz')
    done()
  })
})

const id3 = 'reload: updated before mount'
test(id3, done => {
  let count = 0
  const app = prepare(id3, {
    created () {
      count++
    },
    destroyed () {
      count--
    },
    data: () => ({ msg: 'foo' }),
    render (h) {
      return h('div', this.msg)
    }
  })

  // reload before mount
  api.reload(id3, {
    created () {
      count++
    },
    data: () => ({ msg: 'bar' }),
    render (h) {
      return h('div', this.msg)
    }
  })

  app.$mount()
  expect(app.$el.textContent).toBe('bar')
  expect(count).toBe(1)

  api.reload(id3, {
    created () {
      count += 2
    },
    data: () => ({ msg: 'baz' }),
    render (h) {
      return h('div', this.msg)
    }
  })
  Vue.nextTick(() => {
    expect(app.$el.textContent).toBe('baz')
    expect(count).toBe(3)
    done()
  })
})

const id4 = 'rerender: functional component'
test(id4, done => {
  const app = prepare(id4, {
    functional: true,
    props: {
      msg: { default: 'hello' }
    },
    render (h, ctx) {
      return h('div', ctx.props.msg)
    }
  })

  app.$mount()
  expect(app.$el.textContent).toBe('hello')

  api.rerender(id4, {
    functional: true,
    props: {
      msg: { default: 'bye' }
    },
    render (h, ctx) {
      return h('div', ctx.props.msg)
    }
  })

  Vue.nextTick(() => {
    expect(app.$el.textContent).toBe('bye')
    done()
  })
})

const id5 = 'rerender: functional component with only template updates'
test(id5, done => {
  const _injectStyles = jest.fn(function () {
    this.$style = {
      red: 'red'
    }
  })
  const app = prepare(id5, {
    _injectStyles,
    functional: true,
    render (h, ctx) {
      _injectStyles.call(ctx)
      return h('div', ctx.$style.red)
    }
  })

  app.$mount()
  expect(_injectStyles).toHaveBeenCalledTimes(1)
  expect(app.$el.textContent).toBe('red')

  api.rerender(id5, {
    render (h, ctx) {
      return h('div', ctx.$style.red + ' updated')
    }
  })

  Vue.nextTick(() => {
    expect(app.$el.textContent).toBe('red updated')
    done()
  })
})
