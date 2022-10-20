const logger = console.log
class Event {
  constructor() {
    this._stores = Object.create(null)
  }

  //订阅事件 ctx事件执行的上下文对象
  on(event, handler, ctx) {
    if (typeof handler !== 'function') {
      logger.error('listener must be a function')
      return
    }

    (this._stores[event] = this._stores[event] || []).push({
      cb: handler,
      ctx,
    })

    return this
  }

  //事件类型只订阅一个事件，调用后删除
  once(event, handler, ctx) {
    const that = this

    function on(...args) {
      that.off(event, on)
      handler.apply(this, args)
    }

    this.on(event, on, ctx)

    return that
  }

  //发布事件
  emit(event, ...args) {
    const store = this._stores[event]
    if (store && store.length) {
      for (let i = 0, len = store.length; i < len; i++) {
        store[i].cb.apply(store[i].ctx ?? null, args)
      }
    }
  }

  //取消订阅
  off(event, handler) {
    // all 取消所有的订阅事件
    if (!arguments.length) {
      this._stores = {}
      return
    }

    // specific event
    const store = this._stores[event]
    if (!store) return

    // remove all handlers  取消当前事件类型对应的所有事件
    if (arguments.length === 1) {
      delete store[event]
      return
    }

    // remove specific handler 取消特定事件
    for (let i = 0, len = store.length; i < len; i++) {
      if (store[i].cb === handler) {
        store.splice(i, 1)
        break
      }
    }
    return
  }


  destroy() {
    this._stores = null
  }

}

export default Event
