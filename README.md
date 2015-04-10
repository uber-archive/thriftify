# thriftify

<!--
    [![build status][build-png]][build]
    [![Coverage Status][cover-png]][cover]
    [![Davis Dependency status][dep-png]][dep]
-->

<!-- [![NPM][npm-png]][npm] -->

thrift compiler in js

## Example

```js
var thriftify = require("thriftify");
var path = require('path');

/*example.thrift

struct SomeStruct {
    1:i32 someInt
}
struct BarResult {
    1:bool someBool
}

service foo {
    BarResult bar(1:string someString, 2:SomeStruct someStruct)
}

*/
var spec = thriftify.readSpecSync(path.join(__dirname, 'example.thrift'));

var buf = thriftify.toBuffer({
    someString: 'foobar',
    someStruct: {
        someInt: 24
    }
}, spec, 'foo::bar_args');

// send the `buf` over the wire somewhere

var result = thriftify.fromBuffer(someBuf, spec, 'foo::bar_result');
console.log(result.success); // { someBool: false }
```

## Installation

`npm install thriftify`

## Tests

`npm test`

## NPM scripts

 - `npm run add-licence` This will add the licence headers.
 - `npm run cover` This runs the tests with code coverage
 - `npm run lint` This will run the linter on your code
 - `npm test` This will run the tests.
 - `npm run trace` This will run your tests in tracing mode.
 - `npm run travis` This is run by travis.CI to run your tests
 - `npm run view-cover` This will show code coverage in a browser

## Contributors

 - Lei Zhao

## MIT Licenced

  [build-png]: https://secure.travis-ci.org/uber/thriftify.png
  [build]: https://travis-ci.org/uber/thriftify
  [cover-png]: https://coveralls.io/repos/uber/thriftify/badge.png
  [cover]: https://coveralls.io/r/uber/thriftify
  [dep-png]: https://david-dm.org/uber/thriftify.png
  [dep]: https://david-dm.org/uber/thriftify
  [test-png]: https://ci.testling.com/uber/thriftify.png
  [tes]: https://ci.testling.com/uber/thriftify
  [npm-png]: https://nodei.co/npm/thriftify.png?stars&downloads
  [npm]: https://nodei.co/npm/thriftify
