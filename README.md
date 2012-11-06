# el-streamo

Crazy streams of (html) elements! Stream through a template into a list.

like [sorta](https://github.com/substack/sorta) but different.

<img src=https://secure.travis-ci.org/'Dominic Tarr'/el-streamo.png?branch=master>

## example

``` js 
var elstreamo = require('el-streamo')
var elstream =
elstreamo.writable('#id', function (data) {
  //return a HTML element. yeah, this function is a template
  var el = document.createElement('pre')
  el.innerText = JSON.stringify(data)
  return el
})
```

If the `data` has an `id` property, this will be assigned to the elements,
and you can do updates.

``` js
elstream.write({id: 264, value: 'hello'})
elstream.write({id: 265, value: 'there'})
elstream.write({id: 266, value: 'what'})
elstream.write({id: 267, value: 'ever'})

//this will update the template for the first message!
elstream.write({id: 264, value: 'HELLO'})
```
## customization

`elstreamo.writable` takes more options to enable deletes, and sorting.

``` js
estreamo.writable('#id', {
  //return the id to be used for this element.
  id: function (data) {
    return data.id
  },
  //sort function. (see [sort](#sort))
  sort: function (data1, data2) {
    return data1.x - data2.x
  },
  //return true if this element should be deleted
  delete: function (data) {
    return data._delete
  },
  //return an html element
  template: function (data) {
    var el = document.createElement('pre')
    el.innerText = JSON.stringify(data)
    return el
  },
  //if this returns true, clear all elements.
  clear: function (data) {
    return data === 'CLEAR'
  }
})
```

Above is pretty much the defaults, read the code.

## readable

There is also a readable stream for turning DOM events into streams.

``` js
elstreamo.readable(element, {
  click: function (e) {
    return 'click!'
  }
})
//make a stream of changes in an input, or pressing enter.
elstreamo.readable(input, {
  keyup: function (e) {
    if (e.keyCode == 13) //enter
      this.queue(input.value)
  },
  change: function (e) {
    this.queue(input.value)
  },
  blur: function () {
    this.queue(input.value)
  }
})

```

## License

MIT
