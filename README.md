[![npm version](https://badge.fury.io/js/clockwarp.svg)](https://badge.fury.io/js/clockwarp)

# ClockWrap

ClockWarp is an alternative to the built-in `setTimeout` and `setInterval` functions. 
This library provides time manipulation capabilities that allow you to adjust the 
timing of events in your code. ClockWarp has a time multiplier which can be used 
to make all events run faster or slower, and it also has a fastForward method that 
can be used to move time forward. 

# Installation

To install the latest version on npm locally and save it in your package's `package.json` file:

npm i --save clockwarp

# Example

```js
const clock = new ClockWrap()

clock.setTimeout(() => console.log("Hello World"), 5000);
clock.setTimeout(() => console.log("This is another message"), 5500);

clock.fastForward(5000)
// console output: Hello World

// wait another 500ms
await new Promise((done) => setTimeout(done, 500));
// console output: This is another message
```

# API Documentation

<a name="ClockWarp"></a>

## ClockWarp
Handle events execution on the timeline allowing time manipulation

**Kind**: global class  

* [ClockWarp](#ClockWarp)
    * [new ClockWarp()](#new_ClockWarp_new)
    * [.timeScale](#ClockWarp+timeScale)
    * [.now](#ClockWarp+now)
    * [.fastForward(dt)](#ClockWarp+fastForward)
    * [.setTimeout(callback, duration, [repeat])](#ClockWarp+setTimeout) ⇒ <code>Object</code>
    * [.setInterval(callback, duration)](#ClockWarp+setInterval) ⇒ <code>Object</code>
    * [.clear(event)](#ClockWarp+clear)

<a name="new_ClockWarp_new"></a>

### new ClockWarp()
Constructor

<a name="ClockWarp+timeScale"></a>

### clockWarp.timeScale
Time multiplier for the clock. For example, when setting the value to 2, all events are going to be executed twice faster than usual.

**Kind**: instance property of [<code>ClockWarp</code>](#ClockWarp)  
<a name="ClockWarp+now"></a>

### clockWarp.now
equivalent of `performance.now()`. The value reflects all time manipulations by `fastForrward` or `timeScale`

**Kind**: instance property of [<code>ClockWarp</code>](#ClockWarp)  
<a name="ClockWarp+fastForward"></a>

### clockWarp.fastForward(dt)
Move time of the clock by specified duration. 
This operation will execute all events scheduled for that duration

**Kind**: instance method of [<code>ClockWarp</code>](#ClockWarp)  

| Param | Type | Description |
| --- | --- | --- |
| dt | <code>Number</code> | amount of miliseconds to fast forward |

<a name="ClockWarp+setTimeout"></a>

### clockWarp.setTimeout(callback, duration, [repeat]) ⇒ <code>Object</code>
sets a timer which executes a function once the timer expires.

**Kind**: instance method of [<code>ClockWarp</code>](#ClockWarp)  
**Returns**: <code>Object</code> - scheduled event object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| callback | <code>function</code> |  | A function to be executed after the timer expires. |
| duration | <code>Number</code> |  | The time, in milliseconds that the timer should wait before the specified function or code is executed. |
| [repeat] | <code>Boolean</code> | <code>false</code> | internal. cause function to work as setInterval |

<a name="ClockWarp+setInterval"></a>

### clockWarp.setInterval(callback, duration) ⇒ <code>Object</code>
repeatedly calls a function, with a fixed time delay between each call.

**Kind**: instance method of [<code>ClockWarp</code>](#ClockWarp)  
**Returns**: <code>Object</code> - scheduled event object  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | A function to be executed every `duration` milliseconds. The first execution happens after delay milliseconds. |
| duration | <code>Number</code> | The time, in milliseconds that the timer should wait before the specified function or code is executed. |

<a name="ClockWarp+clear"></a>

### clockWarp.clear(event)
cancels an event previously established by calling `setTimeout` or `setInterval`

**Kind**: instance method of [<code>ClockWarp</code>](#ClockWarp)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | event object to be canceled |

