import assert from 'assert';
import ClockWarp from './ClockWarp.js'
import sinon from 'sinon'

describe("ClockWarp", function() {
  this.retries(3);

  beforeEach(function () {
    this.clock = new ClockWarp()
  });

  [0.5, 1, 2].forEach((timeScale) => describe(`timeScale: ${timeScale}`, function() {

    beforeEach(function () {
      this.clock.timeScale = timeScale
    })

    it("should get current time", async function() {
      const t1 = this.clock.now;
      await new Promise((done) => setTimeout(done, 100));
      const t2 = this.clock.now;
      const dt = t2 - t1;
      const dtMin = timeScale*100*0.9
      const dtMax = timeScale*100*1.2
      assert.ok(
        dt >= dtMin && dt <= dtMax, 
        `after 100ms time passed expected to be between ${dtMin}ms and ${dtMax}ms but got ${dt}ms`
      )
    })

    it("should setTimeout", async function() {
      const callback = sinon.spy()
      this.clock.setTimeout(callback, 100)
      await new Promise((done) => setTimeout(done, 50/timeScale));
      assert.ok(!callback.calledOnce, 'callback not executed before the time passed')
      await new Promise((done) => setTimeout(done, 70/timeScale));
      assert.ok(callback.calledOnce, 'callback executed after the time passed')
    })

    it("should clear Timeout", async function() {
      const callback = sinon.spy()
      const event = this.clock.setTimeout(callback, 100)
      await new Promise((done) => setTimeout(done, 50/timeScale));
      this.clock.clear(event)
      await new Promise((done) => setTimeout(done, 70/timeScale));
      assert.ok(!callback.calledOnce, 'callback not executed after the time passed')
    })

    it("should setInterval", async function() {
      const callback = sinon.spy()
      const event = this.clock.setInterval(callback, 50)
      await new Promise((done) => setTimeout(done, 180/timeScale));
      assert.ok(callback.callCount === 3, "callback should be executed three times. Actual: " + callback.callCount)
      this.clock.clear(event)
      await new Promise((done) => setTimeout(done, 100/timeScale));
      assert.ok(callback.callCount === 3, "callback should not be executed anymore after clear. Actual: " + callback.callCount)

    })

    it("should fast forward events", async function() {
      const callback1 = sinon.spy()
      const callback2 = sinon.spy()
      const callback3 = sinon.spy()

      this.clock.setTimeout(callback1, 5000)

      this.clock.fastForward(1000)

      // @1000ms
      assert.ok(!callback1.called, 'callback1 not executed at 1000ms')
      assert.ok(!callback2.called, 'callback2 not executed at 1000ms')
      assert.ok(!callback3.called, 'callback3 not executed at 1000ms')

      this.clock.setTimeout(callback2, 7000)
      this.clock.setTimeout(callback2, 7100)

      this.clock.fastForward(4000)

      // @8000ms
      assert.ok(callback1.called, 'callback1 executed at 5000ms')
      assert.ok(!callback2.called, 'callback2 not executed at 5000ms')
      assert.ok(!callback3.called, 'callback3 not executed at 5000ms')
    })

  }))

  it("should change time scale", async function() {
    this.clock.timeScale = 0.5
    const t1 = this.clock.now;
    await new Promise((done) => setTimeout(done, 100));
    this.clock.timeScale = 2
    await new Promise((done) => setTimeout(done, 100));
    const t2 = this.clock.now;
    const dt = t2 - t1;
    const dtMin = 250*0.9
    const dtMax = 250*1.2
    assert.ok(
      dt >= dtMin && dt <= dtMax, 
      `after 200ms (scale 0.5 + 2.0) time passed expected to be between ${dtMin}ms and ${dtMax}ms but got ${dt}ms`
    )
  })

  it("should schedule multiple events in order", async function() {
    let order = ""
    const callback1 = () => { order += 'A'}
    const callback2 = () => { order += 'B'}

    this.clock.setTimeout(callback1, 100)
    assert.equal(order, '')
    await new Promise((done) => setTimeout(done, 50));
    this.clock.setTimeout(callback2, 100)
    assert.equal(order, '')
    await new Promise((done) => setTimeout(done, 50));
    assert.equal(order, 'A')
    await new Promise((done) => setTimeout(done, 50));
    assert.equal(order, 'AB')

    this.clock.setTimeout
  })

  it("should schedule multiple events out of order", async function() {
    let order = ""
    const callback1 = () => { order += 'A'} // @400ms
    const callback2 = () => { order += 'B'} // @200ms
    const callback3 = () => { order += 'C'} // @300ms

    this.clock.setTimeout(callback1, 400)
    assert.equal(order, '')
    await new Promise((done) => setTimeout(done, 110));

    // @100ms
    this.clock.setTimeout(callback2, 100)
    this.clock.setTimeout(callback3, 200)
    assert.equal(order, '', 'mismatch at 50ms')
    await new Promise((done) => setTimeout(done, 110));

    // @200ms
    assert.equal(order, 'B', 'mismatch at 200ms')
    await new Promise((done) => setTimeout(done, 110));

    // @300ms
    assert.equal(order, 'BC', 'mismatch at 300ms')
    await new Promise((done) => setTimeout(done, 210));

    // @400ms
    assert.equal(order, 'BCA', 'mismatch at 400ms')
  })

  it("should scale timeouts", async function() {
    // @0ms
    this.clock.timeScale = 1;

    const callback = sinon.spy()
    this.clock.setTimeout(callback, 300)
    await new Promise((done) => setTimeout(done, 110));

    // @100ms
    this.clock.timeScale = 2;
    await new Promise((done) => setTimeout(done, 110));

    // @200ms
    assert.ok(callback.calledOnce)
  })

  it("should execute parallel events (on fast forward)", async function() {
    let order = ''
    const callback1 = () => { order += 'A' }
    const callback2 = () => { order += 'B' }
    const callback3 = () => { order += 'C' }

    this.clock.setTimeout(callback1, 100)
    this.clock.setTimeout(callback2, 100)
    this.clock.setTimeout(callback3, 100)

    this.clock.fastForward(100)

    assert.equal(order, 'ABC')
  })

  it("should execute parallel events (time pass)", async function() {
    let order = ''
    const callback1 = () => { order += 'A' }
    const callback2 = () => { order += 'B' }
    const callback3 = () => { order += 'C' }

    this.clock.setTimeout(callback1, 100)
    this.clock.setTimeout(callback2, 100)
    this.clock.setTimeout(callback3, 100)

    await new Promise((done) => setTimeout(done, 110));

    assert.equal(order, 'ABC')
  })
    
})