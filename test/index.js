
var elstreamo = require('../index')
var test = require('testling')
var ready = require('domready')

ready(function () {
  var d = document.createElement('div')
  document.body.insertBefore(d, document.body.firstChild)
  test('simple', function (t) {

    var ts = elstreamo.writable(d) //default settings

    var r = Math.random()
    var expected = [{hello: 'there'}, 'whatever', r ]

    expected.forEach(ts.write.bind(ts))

    var actual = [].slice.call(d.children).map(function (e) {
      return JSON.parse(e.innerText)
    })
    ts.end()
    t.deepEqual(actual, expected)
    t.end()
  })

  test('delete', function (t) {
    d.innerHTML = ''
    var expected = [
      {id: 'a', r: Math.random()},
      {id: 'b', r: Math.random()},
      {id: 'c', r: Math.random()},
      {id: 'd', r: Math.random()},
      {id: 'a', _delete: true}
    ]
    var ts = elstreamo.writable(d)
    expected.forEach(ts.write.bind(ts))
    var actual = [].slice.call(d.children).map(function (e) {
      return JSON.parse(e.innerText)
    })
    expected.pop(); expected.shift()

    console.log(expected)

    t.deepEqual(actual, expected)

    t.end()
  })

  function sort(ary) {
    ary.sort(function (a, b) {
      return a._sort - b._sort
    })
  }

  function parse (d) {
    return [].slice.call(d.children).map(function (e) {
      return JSON.parse(e.innerText)
    })
  }

  function createElWritable (d) {
    return elstreamo.writable(d, {
      sort: function (a, b) {
        return a._sort - b._sort
      }
    })
  }

  test('sort', function (t) {
    d.innerHTML = ''
    var expected = [
      {id: 'a', _sort: Math.random()},
      {id: 'b', _sort: Math.random()},
      {id: 'c', _sort: Math.random()},
      {id: 'd', _sort: Math.random()},
    ]

    var ts = createElWritable(d)
    expected.forEach(ts.write.bind(ts))
    var actual = parse(d)
    sort(expected)
    t.deepEqual(actual, expected)

    t.end()
  })

  test('sort 2', function (t) {
    d.innerHTML = ''
    var expected = [
      {id: 'a', _sort: Math.random()},
      {id: 'b', _sort: Math.random()},
      {id: 'c', _sort: Math.random()},
      {id: 'd', _sort: Math.random()},
    ]

    var ts = createElWritable(d)
    expected.forEach(ts.write.bind(ts))
    sort(expected)

    //change the order of something and reinsert it
    //this will update that item. it must go back into the right place.
    
    var ch = expected.pop()
    ch._sort = Math.random()
    ts.write(ch)
    expected.push(ch); sort(expected)

    var actual = parse(d)
    t.deepEqual(actual, expected)

    t.end()
  })

  test('sort3', function (t) {
    d.innerHTML = ''
    var expected = [
      {id: 'a', _sort: Math.random()},
      {id: 'b', _sort: Math.random()},
      {id: 'c', _sort: Math.random()},
      {id: 'd', _sort: Math.random()}
    ]

    var ts = createElWritable(d)
    expected.forEach(ts.write.bind(ts))
    sort(expected)
    var actual = parse(d)
    t.deepEqual(actual, expected)
    //reverse the sort
    ts.sort(function (a, b) {
      return b._sort - a._sort
    })
    var actual = parse(d)
    expected.reverse()
    t.deepEqual(actual, expected)
    t.end()
  })
  
})


