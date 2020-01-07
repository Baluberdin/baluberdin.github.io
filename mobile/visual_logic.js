/**
 * Generated by Verge3D Puzzles v.2.10.0 pre2
 * Mon Jan 14 2019 09:40:31 GMT+0300 (Moscow Standard Time)
 * Do not edit this file - your changes may get overridden when Puzzles are saved.
 * Refer to https://www.soft8soft.com/docs/manual/en/introduction/Using-JavaScript.html
 * for information on how to add your own JavaScript to Verge3D apps.
 */

"use strict";

(function() {

// global variables/constants used by puzzles' functions
var _pGlob = {};

_pGlob.objCache = {};
_pGlob.fadeAnnotations = true;
_pGlob.objClickCallbacks = [];
_pGlob.pickedObject = '';
_pGlob.objHoverCallbacks = [];
_pGlob.hoveredObject = '';
_pGlob.objMovementInfos = {};
_pGlob.objDragOverCallbacks = [];
_pGlob.objDragOverInfoByBlock = {}
_pGlob.dragMoveOrigins = {};
_pGlob.dragScaleOrigins = {};
_pGlob.mediaElements = {};
_pGlob.loadedFiles = {};
_pGlob.loadedFile = '';
_pGlob.animMixerCallbacks = [];
_pGlob.arHitPoint = new v3d.Vector3(0, 0, 0);

_pGlob.AXIS_X = new v3d.Vector3(1, 0, 0);
_pGlob.AXIS_Y = new v3d.Vector3(0, 1, 0);
_pGlob.AXIS_Z = new v3d.Vector3(0, 0, 1);
_pGlob.MIN_DRAG_SCALE = 10e-4;

_pGlob.vec2Tmp = new v3d.Vector2();
_pGlob.vec2Tmp2 = new v3d.Vector2();
_pGlob.vec3Tmp = new v3d.Vector3();
_pGlob.vec3Tmp2 = new v3d.Vector3();
_pGlob.quatTmp = new v3d.Quaternion();
_pGlob.quatTmp2 = new v3d.Quaternion();
_pGlob.mat4Tmp = new v3d.Matrix4();
_pGlob.planeTmp = new v3d.Plane();
_pGlob.raycasterTmp = new v3d.Raycaster();

var PL = v3d.PL = v3d.PL || {};

PL.legacyMode = false;

PL.execInitPuzzles = function() {

    var _initGlob = {};
    _initGlob.percentage = 0;
    _initGlob.output = {
        initOptions: {
            fadeAnnotations: true,
            useBkgTransp: false,
            preserveDrawBuf: false,
            useCompAssets: false,
            useFullscreen: true,
            useCustomPreloader: false,
            preloaderStartCb: function() {},
            preloaderProgressCb: function() {},
            preloaderEndCb: function() {},
        }
    }
    // initSettings puzzle
_initGlob.output.initOptions.fadeAnnotations = true;
_initGlob.output.initOptions.useBkgTransp = false;
_initGlob.output.initOptions.preserveDrawBuf = false;
_initGlob.output.initOptions.useCompAssets = true;
_initGlob.output.initOptions.useFullscreen = true;

    return _initGlob.output;
}

PL.init = function(appInstance, initOptions) {

initOptions = initOptions || {};

if ('fadeAnnotations' in initOptions) {
    _pGlob.fadeAnnotations = initOptions.fadeAnnotations;
}
var drawer_status;


// utility function envoked by almost all V3D-specific puzzles
// process object input, which can be either single obj or array of objects, or a group
function retrieveObjectNames(objNames) {
    var acc = [];
    retrieveObjectNamesAcc(objNames, acc);
    return acc;
}

function retrieveObjectNamesAcc(currObjNames, acc) {
    if (typeof currObjNames == "string") {
        acc.push(currObjNames);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "GROUP") {
        var newObj = getObjectNamesByGroupName(currObjNames[1]);
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "ALL_OBJECTS") {
        var newObj = getAllObjectNames();
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames)) {
        for (var i = 0; i < currObjNames.length; i++)
            retrieveObjectNamesAcc(currObjNames[i], acc);
    }
}


// utility function envoked by almost all V3D-specific puzzles
// find first occurence of the object by its name
function getObjectByName(objName) {
    var objFound;
    var runTime = typeof _pGlob != "undefined";
    objFound = runTime ? _pGlob.objCache[objName] : null;
    if (objFound && objFound.name == objName)
        return objFound;
    appInstance.scene.traverse(function(obj) {
        if (!objFound && notIgnoredObj(obj) && (obj.name == objName)) {
            objFound = obj;
            if (runTime)
                _pGlob.objCache[objName] = objFound;
        }
    });
    return objFound;
}

// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects which belong to the group
function getObjectNamesByGroupName(targetGroupName) {
    var objNameList = [];
    appInstance.scene.traverse(function(obj){
        if (notIgnoredObj(obj)) {
            var groupNames = obj.groupNames;
            if (!groupNames)
                return;
            for (var i = 0; i < groupNames.length; i++) {
                var groupName = groupNames[i];
                if (groupName == targetGroupName) {
                    objNameList.push(obj.name);
                }
            }
        }
    });
    return objNameList;
}

// utility function envoked by almost all V3D-specific puzzles
// filter off some non-mesh types
function notIgnoredObj(obj) {
    return (obj.type != "Scene" && obj.type != "AmbientLight" &&
            obj.name != "" && !(obj.isMesh && obj.isMaterialGeneratedMesh));
}

// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects on the scene
function getAllObjectNames() {
    var objNameList = [];
    appInstance.scene.traverse(function(obj) {
        if (notIgnoredObj(obj))
            objNameList.push(obj.name)
    });
    return objNameList;
}

function swizzleValueSign(newAxis, value) {
    newAxis = newAxis.toLowerCase();

    if (newAxis == 'z') {
        if (typeof value == 'number')
            return -value
        else if (typeof value == 'string' && value != '' && value != "''" && value != '""')
            return String(-Number(value));
        else
            return value;
    } else
        return value;
}

function swizzleVec3(vec) {

    var dest = []

    dest[0] = vec[0];
    dest[1] = vec[2];
    dest[2] = swizzleValueSign('z', vec[1])

    return dest;
}


// assignMaterial puzzle
function assignMat(objNames, matName) {
    objNames = retrieveObjectNames(objNames);
    if (!objNames || !matName)
        return;
    var mat = v3d.SceneUtils.getMaterialByName(appInstance, matName);
    if (!mat)
        return;
    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i];
        if (!objName)
            continue;
        var obj = getObjectByName(objName);
        if (obj)
            obj.material = mat;
    }
}



// utility function used by the whenClicked, whenHovered and whenDraggedOver puzzles
function initObjectPicking(callback, eventType, mouseDownUseTouchStart) {

    var elem = appInstance.container;
    elem.addEventListener(eventType, pickListener);
    if (eventType == "mousedown") {
        var touchEventName = mouseDownUseTouchStart ? "touchstart" : "touchend";
        elem.addEventListener(touchEventName, pickListener);
    }

    var raycaster = new v3d.Raycaster();
    var coords = new v3d.Vector2();
    function pickListener(event) {
        event.preventDefault();

        var xNorm = 0, yNorm = 0;
        if (event instanceof MouseEvent) {
            xNorm = event.offsetX / elem.clientWidth;
            yNorm = event.offsetY / elem.clientHeight;
        } else if (event instanceof TouchEvent) {
            var rect = elem.getBoundingClientRect();
            xNorm = (event.changedTouches[0].clientX - rect.left) / rect.width;
            yNorm = (event.changedTouches[0].clientY - rect.top) / rect.height;
        }

        coords.x = xNorm * 2 - 1;
        coords.y = -yNorm * 2 + 1;
        raycaster.setFromCamera(coords, appInstance.camera);
        var objList = [];
        appInstance.scene.traverse(function(obj){objList.push(obj);});
        var intersects = raycaster.intersectObjects(objList);
        if (intersects.length > 0) {
            var obj = intersects[0].object;
            callback(obj, event);
        } else {
            callback(null, event);
        }
    }
}

// utility function used by the whenDraggedOver puzzles
function fireObjectPickingCallbacks(objName, source, index, cbParam) {
    for (var i = 0; i < source.length; i++) {
        var cb = source[i];
        if (objectsIncludeObj([cb[0]], objName)) {
            cb[index](cbParam);
        }
    }
}

function objectsIncludeObj(objNames, testedObjName) {
    if (!testedObjName) return false;

    for (var i = 0; i < objNames.length; i++) {
        if (testedObjName == objNames[i]) {
            return true;
        } else {
            // also check children which are auto-generated for multi-material objects
            var obj = getObjectByName(objNames[i]);
            if (obj && obj.type == "Group") {
                for (var j = 0; j < obj.children.length; j++) {
                    if (testedObjName == obj.children[j].name) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// utility function used by the whenClicked, whenHovered and whenDraggedOver puzzles
function getPickedObjectName(obj) {
    // auto-generated from a multi-material object, use parent name instead
    if (obj.isMesh && obj.isMaterialGeneratedMesh && obj.parent) {
        return obj.parent.name;
    } else {
        return obj.name;
    }
}



// whenClicked puzzle
initObjectPicking(function(obj) {

    // save the object for the pickedObject block
    _pGlob.pickedObject = obj ? getPickedObjectName(obj) : '';

    _pGlob.objClickCallbacks.forEach(function(el) {
        var isPicked = obj && objectsIncludeObj(el.objNames, getPickedObjectName(obj));
        el.callbacks[isPicked ? 0 : 1]();
    });
}, 'mousedown');



// whenClicked puzzle
function registerOnClick(objNames, cbDo, cbIfMissedDo) {
    objNames = retrieveObjectNames(objNames) || [];
    var objNamesFiltered = objNames.filter(function(name) {
        return name;
    });
    _pGlob.objClickCallbacks.push({
        objNames: objNamesFiltered,
        callbacks: [cbDo, cbIfMissedDo]
    });
}



function matGetReplaceableTextures(matName) {

    var textures = [];

    var mat = v3d.SceneUtils.getMaterialByName(appInstance, matName);
    if (!mat) return [];

    switch (mat.type) {
    case 'MeshNodeMaterial':
        textures = Object.values(mat.nodeTextures);
        break;

    case 'MeshBlenderMaterial':
        textures = [
            mat.map, mat.lightMap, mat.aoMap, mat.emissiveMap,
            mat.bumpMap, mat.normalMap, mat.displacementMap,
            mat.specularMap, mat.alphaMap, mat.envMap
        ];
        break;

    case 'MeshStandardMaterial':
        textures = [
            mat.map, mat.lightMap, mat.aoMap, mat.emissiveMap,
            mat.bumpMap, mat.normalMap, mat.displacementMap,
            mat.roughnessMap, mat.metalnessMap, mat.alphaMap, mat.envMap
        ]
        break;

    case 'MeshPhongMaterial':
        textures = [
            mat.map, mat.lightMap, mat.aoMap, mat.emissiveMap,
            mat.bumpMap, mat.normalMap, mat.displacementMap,
            mat.specularMap, mat.alphaMap, mat.envMap
        ];
        break;
    }

    return textures.filter(function(elem) {
        // check "Texture" type exactly
        return elem && (elem.constructor == v3d.Texture || elem.constructor == v3d.DataTexture);
    });
}


// replaceTexture puzzle
function replaceTexture(matName, texName, url) {
    var textures = matGetReplaceableTextures(matName).filter(function(elem) {
        return elem.name == texName;
    });

    if (!textures.length) return;

    var isHDR = (url.search(/\.hdr$/) > 0);

    if (!isHDR) {
        var loader = new v3d.ImageLoader();
        loader.setCrossOrigin('Anonymous');
    } else {
        var loader = new v3d.FileLoader();
        loader.setResponseType('arraybuffer');
    }

    loader.load(url, function(image) {
        // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
        var isJPEG = url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data\:imag\/jpeg/) === 0;

        textures.forEach(function(elem) {

            if (!isHDR) {
                elem.image = image;
            } else {
                // parse loaded HDR buffer
                var rgbeLoader = new v3d.RGBELoader();
                var texData = rgbeLoader._parser(image);

                // NOTE: reset params since the texture may be converted to float
                elem.type = v3d.UnsignedByteType;
                elem.encoding = v3d.RGBEEncoding;

                elem.image = {
                    data: texData.data,
                    width: texData.width,
                    height: texData.height
                }

                elem.magFilter = v3d.LinearFilter;
                elem.minFilter = v3d.LinearFilter;
                elem.generateMipmaps = false;
                elem.isDataTexture = true;

            }

            elem.format = isJPEG ? v3d.RGBFormat : v3d.RGBAFormat;
            elem.needsUpdate = true;

            // update world material if it is using this texture
            var wMat = appInstance.worldMaterial;
            if (wMat)
                for (var texName in wMat.nodeTextures)
                    if (wMat.nodeTextures[texName] == elem)
                        appInstance.updateEnvironment(wMat);

        });

    });
}



// animation puzzles
function getSceneByAction(action) {
    var root = action.getRoot();
    var scene = root.type == "Scene" ? root : null;
    root.traverseAncestors(function(ancObj) {
        if (ancObj.type == "Scene") {
            scene = ancObj;
        }
    });
    return scene;
}



// animation puzzles
function getSceneAnimFrameRate(scene) {
    if (scene && "v3d" in scene.userData && "animFrameRate" in scene.userData.v3d) {
        return scene.userData.v3d.animFrameRate;
    }
    return 24;
}



// animation puzzles
(function() {
    if (!appInstance.mixer)
        return;
    appInstance.mixer.addEventListener("finished", function(e) {
        var cb = _pGlob.animMixerCallbacks;
        var found = [];
        for (var i = 0; i < cb.length; i++) {
            if (cb[i][0] == e.action) {
                cb[i][0] = null; // desactivate
                found.push(cb[i][1]);
            }
        }
        for (var i = 0; i < found.length; i++) {
            found[i]();
        }
    });
})();



// animation puzzles
function operateAnimation(operation, animations, from, to, loop, timeScale, callback, isPlayAnimCompat) {
    if (!animations) return;
    // input can be either single obj or array of objects
    if (typeof animations == "string") animations = [animations];
    for (var i = 0; i < animations.length; i++) {
        var animName = animations[i];
        if (!animName) continue;
        var action = v3d.SceneUtils.getAnimationActionByName(appInstance, animName);
        if (!action) continue;
        switch (operation) {
        case "PLAY":
            if (!action.isRunning()) {
                action.reset();
                if (loop && (loop != "AUTO"))
                    action.loop = v3d[loop];
                var scene = getSceneByAction(action);
                var frameRate = getSceneAnimFrameRate(scene);

                // compatibility reasons: deprecated playAnimation puzzles don't
                // change repetitions
                if (!isPlayAnimCompat) {
                    action.repetitions = Infinity;
                }

                action.timeScale = timeScale;
                action.timeStart = from !== null ? from/frameRate : 0;
                if (to !== null) {
                    action.getClip().duration = to/frameRate;
                } else {
                    action.getClip().resetDuration();
                }
                action.time = timeScale >= 0 ? action.timeStart : action.getClip().duration;

                action.paused = false;
                action.play();

                // push unique callbacks only
                var callbacks = _pGlob.animMixerCallbacks;
                var found = false;

                for (var j = 0; j < callbacks.length; j++)
                    if (callbacks[j][0] == action && callbacks[j][1] == callback)
                        found = true;

                if (!found)
                    _pGlob.animMixerCallbacks.push([action, callback]);
            }
            break;
        case "STOP":
            action.stop();

            // remove callbacks
            var callbacks = _pGlob.animMixerCallbacks;
            for (var j = 0; j < callbacks.length; j++)
                if (callbacks[j][0] == action) {
                    callbacks.splice(j, 1);
                    j--
                }

            break;
        case "PAUSE":
            action.paused = true;
            break;
        case "RESUME":
            action.paused = false;
            break;
        case "SET_FRAME":
            var frameRate = getSceneAnimFrameRate(scene);
            action.time = from ? from/frameRate : 0;
            action.play();
            action.paused = true;
            break;
        }
    }
}



registerOnClick("Sphere_chrome", function() {
  assignMat("legs", "chrome");
}, function() {});

registerOnClick("Sphere_paint_black", function() {
  assignMat("legs", "paint_black");
}, function() {});

registerOnClick("Sphere_paint_white", function() {
  assignMat("legs", "paint_white");
}, function() {});

registerOnClick("plank_wood1", function() {
  replaceTexture("wood_original", "Map #6", 'wood_basecolor_1.jpg');
}, function() {});

registerOnClick("plank_wood2", function() {
  replaceTexture("wood_original", "Map #6", 'wood_basecolor_2.jpg');
}, function() {});

registerOnClick("plank_wood3", function() {
  replaceTexture("wood_original", "Map #6", 'wood_basecolor_3.jpg');
}, function() {});


operateAnimation("STOP", "drawer", null, null, 'AUTO', 1,
        function() {}, undefined);


drawer_status = 'closed';

registerOnClick("drawer", function() {
  if (drawer_status == 'closed') {

    operateAnimation("PLAY", "drawer", null, null, 'LoopOnce', 1,
            function() {
      drawer_status = 'open';
    }, undefined);

        } else if (drawer_status == 'open') {

    operateAnimation("PLAY", "drawer", null, null, 'LoopOnce', -1,
            function() {
      drawer_status = 'closed';
    }, undefined);

        }
}, function() {});

} // end of PL.init function

if (window.v3dApp) {
    // backwards compatibility for old player projects
    PL.legacyMode = true;
    PL.init(window.v3dApp);
}

})(); // end of closure

/* ================================ end of code ============================= */
