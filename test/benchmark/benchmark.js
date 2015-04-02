var tt = require('../../');
var path = require('path');
var ncarSpec = tt.newSpec(path.join(__dirname, 'ncar.thrift'));
var thriftrw = require('thriftrw');
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

////////////////////////////////////////////////////////
// setup

var data = {
    success: {
        '8': {
            id: 8,
            cars: [{
                id: 8002305,
                distance: 0.108466026,
                latitude: 37.7842386,
                longitude: -122.415108,
                vehicleCategoryId: 191,
                updateTime: 1427845964457,
                peerId: 9,
                status: 'Open',
                token: 'a589dd3cff50a9bb1985a44e790a63a3',
                vehicleId: 278959,
                vehicleUUID: '1356e761-fe7e-4449-934f-d7700663f72b',
                meta: {
                    shouldIgnore: false
                },
                uuid: 'c26c22bd-d3a8-4969-88e7-9ebd27220857'
            }],
            cacheEmpty: false
        }
    }
};

var bin = tt.toBuffer(data, ncarSpec, 'NCar::find_as_thrift_result');

var str = JSON.stringify(data);
var strRaw = new Buffer(str);

var resultType = ncarSpec.getType('NCar::find_as_thrift_result');
var uglifed = resultType.uglify(data);
var reified = resultType.reify(uglifed);
var output = new Buffer(bin.length);

////////////////////////////////////////////////////////////
// add tests
suite.add('thrift serialization', function() {
    tt.toBuffer(data, ncarSpec, 'NCar::find_as_thrift_result');
}).add('json stringify', function() {
    new Buffer(JSON.stringify(data));
}).add('thrift deserialization', function() {
    tt.fromBuffer(bin, ncarSpec, 'NCar::find_as_thrift_result');
}).add('json parse', function() {
    JSON.parse(strRaw.toString());
}).add('uglify', function() {
    resultType.uglify(data);
}).add('reify', function() {
    resultType.reify(uglifed);
}).add('bufrw read', function() {
    thriftrw.TStructRW.readFrom(output, 0);
}).add('bufrw write', function() {
    thriftrw.TStructRW.writeInto(uglifed, output, 0);
})

    // add listeners
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    // run async
    .run({'async': true});
