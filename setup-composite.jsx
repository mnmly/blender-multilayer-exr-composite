var docRef=app.activeDocument;

var cryptoLayers = []
for (var i = 0; i < docRef.layers.length; i++) {
    var l = docRef.layers[i]
    if (l.typename === "ArtLayer") {
        cryptoLayers.push(l)
    }
}

var viewLayer = docRef.layerSets.getByName('ViewLayer')
var cryptoMaterials = viewLayer.layerSets.add()
var composite = viewLayer.layerSets.add()
var passes = ['Emit+Env', 'Diffuse', 'Gloss', 'Transmission']
passes = passes.reverse()
var passLayers = {'Diffuse': [], 'Gloss': [], 'Transmission': [], 'Emit+Env': [] };

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(obj, start) {
    for (var i = (start || 0), j = this.length; i < j; i += 1) {
      if (this[i] === obj) { return i; }
    }
    return -1;
  }
}

cryptoMaterials.name = 'CryptoMaterials'
composite.name = '_Composite';


for (var i = 0; i < viewLayer.layers.length; i++) {
    var _name = viewLayer.layers[i].name;
    var _layer = viewLayer.layers[i];
    if (/Diff/.test(_name)) {
        passLayers['Diffuse'].push(_layer);
    } else if (/Gloss/.test(_name)) {
        passLayers['Gloss'].push(_layer);
    } else if (/Trans/.test(_name)) {
        passLayers['Transmission'].push(_layer)
    } else if (/Emit/.test(_name) || /Env/.test(_name)) {
        passLayers['Emit+Env'].push(_layer)
    }
}

var names = []
for (var i = 0; i < cryptoLayers.length; i++) {
    cryptoLayers[i].move(cryptoMaterials, ElementPlacement.PLACEATEND)
}

var compositeList = ['Diffuse', 'Gloss', 'Transmission']

for (var i = 0; i < passes.length; i++) {
    var l = composite.layerSets.add();
    var _name = passes[i]
    l.name = _name;
    if (i !== 0) {
        l.blendMode = BlendMode.LINEARDODGE;
    }
    if (compositeList.indexOf(_name) > -1) {
        var indirAndDir = l.layerSets.add();
        indirAndDir.name = 'indir+dir'
        for (var j = 0; j < passLayers[_name].length; j++) {
            // alert(passLayers[_name][j].name)
            if ( j == 0 ) {
                passLayers[_name][j].move(l, ElementPlacement.PLACEAFTER);
                passLayers[_name][j].blendMode = BlendMode.MULTIPLY;
            } else {
                if ( j == 1 ) {
                    passLayers[_name][j].blendMode = BlendMode.LINEARDODGE;
                }
                passLayers[_name][j].move(indirAndDir, ElementPlacement.PLACEATEND);
            }
            if ( j == passLayers[_name].length - 1) {
                passLayers[_name][0].move(indirAndDir, ElementPlacement.PLACEBEFORE);
            }
        }
    } else {
        for (var j = 0; j < passLayers[_name].length; j++) {
            passLayers[_name][j].blendMode = BlendMode.LINEARDODGE;
            passLayers[_name][j].move(l, ElementPlacement.PLACEATEND);
        }
    }
}


alert(names.join(', '))