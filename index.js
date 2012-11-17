var through = require('through')

function getElement(el) {
  if ('string' === typeof el)
    return document.querySelector(el)
  return el
}

//for things like CRDT, we want this to read from elements that already exist,
//OR are emitted.
// var write = es.write.bind(es); seq.each(write); es.on('update', write);
// ^ works like that

exports.read = 
exports.reader =
exports.readable = function (el, events) {
  el = getElement(el)

  var ts = through()
  ts.writable = false
  ts.write = null
  var listeners = {}

  function add(event, listener) {
    listener = listeners[event] = listener 
      ? listener.bind(ts)
      : function (e) {
        ts.queue(e);
      }
    el.addEventListener(event, listener, false)
  }

  //also allow events to be a single stream, etc.
  for(var k in events)
    add(k, events[k])

  ts.on('close', function () {
    for(var k in listeners) 
    el.removeEventListener(k, listeners[k])
  })

  return ts
}

function get (data, key) {
  return 'function' == typeof data.get
    ? data.get(key)
    : data[key]
}

var defaults = {
  id: function (data) {
    return get(data,'id') || 'id_'+(''+Math.random()).substring(2)
  },
  sort: function (a, b) {
    return get(a, '_sort') - get(b, '_sort')
  },
  delete: function (data) {
    return get(data, '_delete')
  },
  template: function (data) {
    var el = document.createElement('pre')
    el.innerText = JSON.stringify(data)
    return el
  },
  clear: function (data) {
    return data === 'CLEAR'
  }
}

function merge (o, d) {
  var r = {}
  for (var k in d)
    r[k] = o[k] || d[k]
  return r
}

function getById (el, id) {
  return el.querySelector 
    ? el.querySelector('#'+id)
    : document.getElementById(id)
}

exports.write = 
exports.writer = 
exports.writable = function (el, opts) {
  el = getElement(el)
  opts = opts || {}
  
  var t = 'function' === typeof opts 
    ? {template: opts}
    : opts

  t = merge(t, defaults)
  var objects = {}

  function orderedInsert(el, ch) {
    var length = el.childElementCount
    var c = 0

    function insert (parent, el, i) {
      if(i == parent.childElementCount)
        parent.appendChild(el)
      else
        parent.insertBefore(el, parent.children[i])
    }

    function cmp(k) {
      var _id = el.children[k].id
      return opts.sort(objects[ch.id], objects[_id])
    }

    function between (i, j) {
      if(c ++ > 20)
        return
      if(i > j) throw new Error('broken:'+i+','+j)
      if(i === j)
        return insert(el, ch, j)
      //select index to split on
      var k = ~~((i + j) / 2)
    
      if(cmp(k) > 0)
        between(k + 1, j)
      else
        between(i, k)
      return
    }
    if(length === 0) {
      insert(el, ch, 0)
    } else
      between(0, length)
  }

  var ts = through (function (data) {
    if(t.clear(data))
      return ts.clear()

    //see if an element already exists with this id.
    var id = t.id(data)
    var _ch = id && getById(el, id)

    //returning false indicates to remove the item.
    if(t.delete(data) && _ch) {
      delete objects[id]
      return el.removeChild(_ch)
    }

    //create update
    var ch = t.template.call(_ch, data)
    //if the template did not add a id,

    //the template just updated the element, do not replace it.
    if(ch === _ch) return

    //set the id.
    if(ch && !ch.id && id) ch.id = id
    //check if there is an old element with the same id.
    if(!_ch && ch.id) _ch = getById(id)
    objects[id] = data

    //replace needs to check if the sort has changed...
    //just remove the old child, and insert new one.

    if(!opts.sort) {
      if(ch && _ch && ch !== _ch)
        el.replaceChild(ch, _ch)
      else
        el.appendChild(ch)
    } else {
      if(ch && _ch)
        return el.removeChild(_ch), orderedInsert(el, ch)
      else
        orderedInsert(el, ch)
    }
    ts.queue(ch)
  }, function () {
    ts.queue(null)
  })

  ts.sort = function (cmp) {
    opts.sort = cmp
    var a = []
    // remove all elements and add them back.
    // there is probably a better way to do this, 
    // only removing items which are out of order.
    // what is the best algorithm to sort a linked list?
    while(el.childElementCount > 1)
      a.push(el.firstChild), el.removeChild(el.firstChild)
    a.forEach(function (ch) {
      orderedInsert(el, ch)
    })
  }

  ts.clear = function () {
    el.textContent = ""
    bottom = null
    objects = {}
    this.resume()
    return
  }
  return ts
}

//DO SOMETHING WITH THIS STUFF!

function getMax() {
  return window.scrollY + window.innerHeight
}

function getBottom(ch) {
  return ch.offsetTop + ch.clientHeight
}

function pause () {
  // make a stream that just 
  // pauses when something is written off the screen.
}

// TODO, make this sort items!
// 

/*
  //make this a separate stream...
  //that will be important when playing
  //tracks off services with loads of stuff
  //such as youtube.
  var  max = getMax(), bottom = null, ts
  window.addEventListener('scroll', function () {
    max = getMax()
    if(bottom && max > getBottom(bottom) - 1)
      ts.resume()
  })
  window.addEventListener('resize', function () {
    max = getMax()
    if(bottom && max > getBottom(bottom) - 1)
      ts.resume()
  })
*/

