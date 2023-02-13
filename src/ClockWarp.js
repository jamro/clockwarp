/**
 * Handle events execution on the timeline allowing time manipulation
 */
class ClockWarp {

  /**
   * Constructor
   */
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

  /**
   * Time multiplier for the clock. For example, when setting the value to 2, all events are going to be executed twice faster than usual.
   */
  set timeScale(scale) {
    this._updateElapsed()
    this._timeScale = scale
    this._scheduleNextEvent()
  }

  get timeScale() {
    return this._timeScale
  }

  /**
   * equivalent of `performance.now()`. The value reflects all time manipulations by `fastForrward` or `timeScale`
   */
  get now() {
    this._updateElapsed()
    return this._elapsed
  }

  /**
   * Move time of the clock by specified duration. 
   * This operation will execute all events scheduled for that duration
   * @param {Number} dt - amount of miliseconds to fast forward
   */
  fastForward(dt) {
    this._updateElapsed()
    this._elapsed += dt
    while(this._execOverdueEvent())
    this._scheduleNextEvent()
  }

  /**
   * sets a timer which executes a function once the timer expires.
   * @param {Function} callback - A function to be executed after the timer expires.
   * @param {Number} duration - The time, in milliseconds that the timer should wait before the specified function or code is executed.
   * @param {Boolean} [repeat] - internal. cause function to work as setInterval
   * @returns {Object} scheduled event object
   */
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
  /**
   * repeatedly calls a function, with a fixed time delay between each call.
   * @param {Function} callback - A function to be executed every `duration` milliseconds. The first execution happens after delay milliseconds.
   * @param {Number} duration - The time, in milliseconds that the timer should wait before the specified function or code is executed.
   * @returns {Object} scheduled event object
   */
  setInterval(callback, duration) {
    return this.setTimeout(callback, duration, true)
  }

  /**
   * cancels an event previously established by calling `setTimeout` or `setInterval`
   * @param {Object} event - event object to be canceled
   */
  clear(event) {
    const index = this._events.indexOf(event)
    if(index === -1) return
    this._events.splice(index, 1)
    this._refresh()
  }

}


export default ClockWarp;