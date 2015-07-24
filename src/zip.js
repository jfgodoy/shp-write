var write = require('./write'),
    geojson = require('./geojson'),
    prj = require('./prj'),
    JSZip = require('jszip');

module.exports = function(gj, options) {

    var zip = new JSZip(),
        zipOpts = {compression: 'STORE'},
        layers;

    options = options || {};

    if (options.folder === false) {
        layers = zip;
    } else {
        layers = zip.folder(options.folder ? options.folder : 'layers');
    }


    [geojson.point(gj), geojson.line(gj), geojson.polygon(gj)]
        .forEach(function(l) {
        if (l.geometries.length) {
            write(
                // field definitions
                l.properties,
                // geometry type
                l.type,
                // geometries
                l.geometries,
                function(err, files) {
                    var fileName = options.types[l.type.toLowerCase()] ? options.types[l.type.toLowerCase()] : l.type;
                    layers.file(fileName + '.shp', files.shp.buffer, { binary: true });
                    layers.file(fileName + '.shx', files.shx.buffer, { binary: true });
                    layers.file(fileName + '.dbf', files.dbf.buffer, { binary: true });
                    layers.file(fileName + '.prj', options.prj || prj);
                });
        }
    });


    for (var k in options.zipOpts) {
        zipOpts[k] = options.zipOpts[k];
    }

    return zip.generate(zipOpts);
};
