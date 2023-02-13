export default class ClockWarp {

  constructor() {
    this._timeScale = 1;
    this._elapsed = performance.now()
    this._lastElpasedUpdateTime = performance.now()
    this._events = []
    this._refreshTimeout = null
  }

  _scheduleNextEvent() {
    // ensure that _updateElapsed() is called before _scheduleNextEvent()
    if(this._refreshTimeout) {
      clearTimeout(this._refreshTimeout)
      this._refreshTimeout = null
    }
    if(this._events.length === 0) return
    const nextEvent = this._events[this._events.length-1]
    const dt = nextEvent.timestamp - this._elapsed
    this._refreshTimeout = setTimeout(() => this._refresh(), dt/this.timeScale)
  }

  _execOverdueEvent() {
    if(this._events.length === 0) {
      return false
    }
    let nextEvent = this._events[this._events.length-1]
    if(nextEvent.timestamp > this._elapsed) {
      return false
    }

    this._events.pop()
    nextEvent.callback()
    if(nextEvent.interval) {
      nextEvent.timestamp += nextEvent.interval
      this._events.push(nextEvent)
      this._events = this._events.sort((a, b) => b.timestamp - a.timestamp)
    }
    return true
  }

  _refresh() {
    this._updateElapsed()
    if(this._refreshTimeout) {
      clearTimeout(this._refreshTimeout)
      this._refreshTimeout = null
    }
    this._execOverdueEvent()
    if(this._events.length > 0) {
      this._scheduleNextEvent()
    }
  }

  _updateElapsed() {
    const now = performance.now()
    const dt = (now - this._lastElpasedUpdateTime)*this._timeScale
    this._lastElpasedUpdateTime = now
    this._elapsed += dt
  }

  set timeScale(scale) {
    this._updateElapsed()
    this._timeScale = scale
    this._scheduleNextEvent()
  }

  get timeScale() {
    return this._timeScale
  }

  get now() {
    this._updateElapsed()
    return this._elapsed
  }

  fastForward(dt) {
    this._updateElapsed()
    this._elapsed += dt
    while(this._execOverdueEvent())
    this._scheduleNextEvent()
  }

  setTimeout(callback, duration, repeat=false) {
    this._updateElapsed()
    const timestamp = this._elapsed + duration
    const event = {timestamp, callback}
    if(repeat) {
      event.interval = duration
    }
    this._events.push(event)
    this._events = this._events.sort((a, b) => b.timestamp - a.timestamp)
    this._scheduleNextEvent()
    return event
  }

  setInterval(callback, duration) {
    return this.setTimeout(callback, duration, true)
  }

  clear(event) {
    const index = this._events.indexOf(event)
    if(index === -1) return
    this._events.splice(index, 1)
    this._refresh()
  }

}
