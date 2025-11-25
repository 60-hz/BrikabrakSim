/******/ (() => { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because a global variable is assign and maybe created.
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  CubemapFramebuffer: () => (/* reexport */ CubemapFramebuffer)
});

;// CONCATENATED MODULE: external "CABLES"
const external_CABLES_namespaceObject = CABLES;
;// CONCATENATED MODULE: ./src/corelibs/cgl_cubemapframebuffer/cubemaptexture.js


const DEFAULT_TEXTURE_SIZE = 8;

class CubemapTexture
{
    constructor(cgl, options)
    {
        this.id = external_CABLES_namespaceObject.utils.uuid();
        this.name = options.name || "unknown cubemap texture";
        this._cgl = cgl;
        this.textureType = CGL.Texture.TYPE_DEFAULT;
        this._options = options;

        if (!this._cgl.gl) return;

        this._cubemapFaces = [
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];

        this.cubemap = this.tex = this._cgl.gl.createTexture();

        this.texTarget = this._cgl.gl.TEXTURE_CUBE_MAP;

        this.width = DEFAULT_TEXTURE_SIZE;
        this.height = DEFAULT_TEXTURE_SIZE;

        this.filter = options.filter || CGL.Texture.FILTER_NEAREST;
        this.wrap = options.wrap || CGL.Texture.WRAP_CLAMP_TO_EDGE;
        this.unpackAlpha = options.unpackAlpha || true;

        this.flip = options.flip || true;

        if (!options.hasOwnProperty("pixelFormat") || !options.pixelFormat)
        {
            if (options.isFloatingPointTexture) options.pixelFormat = CGL.Texture.PFORMATSTR_RGBA32F;
            else options.pixelFormat = CGL.Texture.PFORMATSTR_RGBA8UB;
        }

        this.pixelFormat = options.pixelFormat;

        // if (options.isFloatingPointTexture) this.textureType = Texture.TYPE_FLOAT;

        this._cgl.profileData.profileTextureNew++;

        this.setSize(options.width, options.height);
    }

    getInfo()
    {
        return { "pixelFormat": this.pixelFormat };
    }

    setSize(w, h)
    {
        // if (this.width == w && this.height == h) return;

        this.delete();
        this.cubemap = this.tex = this._cgl.gl.createTexture();

        this._cgl.checkFrameStarted("cubemap corelib setsize");

        if (w != w || w <= 0 || !w) w = DEFAULT_TEXTURE_SIZE;
        if (h != h || h <= 0 || !h) h = DEFAULT_TEXTURE_SIZE;

        if (w > this._cgl.maxTexSize || h > this._cgl.maxTexSize) console.error("texture size too big! " + w + "x" + h + " / max: " + this._cgl.maxTexSize);

        w = Math.min(w, this._cgl.maxTexSize);
        h = Math.min(h, this._cgl.maxTexSize);

        w = Math.floor(w);
        h = Math.floor(h);

        this.width = w;
        this.height = h;

        this._cgl.gl.bindTexture(this.texTarget, this.tex);
        this._cgl.profileData.profileTextureResize++;

        const info = CGL.Texture.setUpGlPixelFormat(this._cgl, this._options.pixelFormat);
        this.pixelFormat = info.pixelFormat;

        if (CGL.Texture.isPixelFormatHalfFloat(info.pixelFormat))
        {
            const extcb = this._cgl.enableExtension("EXT_color_buffer_half_float");

            if (!this._cgl.enableExtension("OES_texture_float_linear"))
            {
                this.filter = CGL.Texture.FILTER_NEAREST;
            }
        }
        else if (CGL.Texture.isPixelFormatFloat(info.pixelFormat))
        {
            if (!this._cgl.enableExtension("OES_texture_float_linear"))
            {
                console.log("no linear pixelformat,using nearest");
                this.filter = CGL.Texture.FILTER_NEAREST;
            }
        }
        // console.log("cubemaptex setfilter...");

        for (let i = 0; i < 6; i++)
        {
            // console.log("cube tex ", i);

            // if (this._cgl.glVersion == 1)console.log("webgl1");
            // {
            // if (this._cgl.glUseHalfFloatTex)
            // {
            //     const ext = this._cgl.enableExtension("OES_texture_half_float");
            //     if (this._cgl.glVersion == 1 && !ext) throw new Error("no half float texture extension");

            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, ext.HALF_FLOAT_OES, null);
            // }
            // else
            // {
            //     const ext = this._cgl.enableExtension("OES_texture_float");

            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
            // }
            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, null);
            // }
            // else
            // {
            // this._cgl.enableExtension("EXT_color_buffer_float");
            // this._cgl.enableExtension("OES_texture_float_linear"); // yes, i am sure, this is a webgl 1 and 2 ext

            // console.log(info);
            this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, info.glInternalFormat, this.width, this.height, 0, info.glDataFormat, info.glDataType, null);

            // if (this.textureType == Texture.TYPE_FLOAT)
            // {
            //     // console.log("cubemap FLOAT TEX", this._options);
            //     this._cgl.enableExtension("EXT_color_buffer_float");
            //     this._cgl.enableExtension("OES_texture_float_linear"); // yes, i am sure, this is a webgl 1 and 2 ext

            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA32F, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
            // }
            // else
            // {
            //     this._cgl.gl.texImage2D(this._cubemapFaces[i], 0, this._cgl.gl.RGBA, this.width, this.height, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, null);
            // }
            // }
            // * NOTE: was gl.RGBA32F && gl.FLOAT instead of gl.RGBA && gl.UNSIGNED_BYTE
        }

        this._setFilter();

        // console.log("cubemaptex update mips ..");
        this.updateMipMap();
        // console.log("cubemaptex ende");
        this._cgl.gl.bindTexture(this.texTarget, null);
    }

    _setFilter()
    {
        this._cgl.checkFrameStarted("cubemap corelib");

        this._cgl.gl.pixelStorei(this._cgl.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.unpackAlpha);

        if (CGL.Texture.isPixelFormatFloat(this.pixelFormat) && this.filter == CGL.Texture.FILTER_MIPMAP)
        {
            console.log("texture: HDR and mipmap filtering at the same time is not possible");
            this.filter = CGL.Texture.FILTER_LINEAR;
        }

        if (this._cgl.glVersion == 1 && !CGL.Texture.isPowerOfTwo())
        {
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);

            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
            this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);

            this.filter = CGL.Texture.FILTER_NEAREST;
            this.wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
        }
        else
        {
            if (this.wrap == CGL.Texture.WRAP_CLAMP_TO_EDGE)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);
            }
            else if (this.wrap == CGL.Texture.WRAP_REPEAT)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.REPEAT);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.REPEAT);
            }
            else if (this.wrap == CGL.Texture.WRAP_MIRRORED_REPEAT)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.MIRRORED_REPEAT);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.MIRRORED_REPEAT);
            }
            else
            {
                throw new Error("[CubemapTexture] unknown texture filter!" + this.filter);
            }

            if (this.filter == CGL.Texture.FILTER_NEAREST)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.NEAREST);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.NEAREST);
            }
            else if (this.filter == CGL.Texture.FILTER_LINEAR)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
            }
            else if (this.filter == CGL.Texture.FILTER_MIPMAP)
            {
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
                this._cgl.gl.texParameteri(this.texTarget, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR_MIPMAP_LINEAR);
            }
            else
            {
                throw new Error("[CubemapTexture] unknown texture filter!" + this.filter);
            }
        }
    }

    updateMipMap()
    {
        // if (!((this._cgl.glVersion == 2 || Texture.isPowerOfTwo()) && this.filter == CGL.Texture.FILTER_MIPMAP)) return;

        if (this.filter == CGL.Texture.FILTER_MIPMAP)
        {
            this._cgl.gl.bindTexture(this.texTarget, this.tex);
            this._cgl.gl.generateMipmap(this.texTarget);
            this._cgl.profileData.profileGenMipMap++;
        }
    }

    delete()
    {
        this._cgl.gl.deleteTexture(this.tex);
    }
}

;// CONCATENATED MODULE: ./src/corelibs/cgl_cubemapframebuffer/cubemapframebuffer.js


class CubemapFramebuffer
{
    constructor(cgl, width, height, options)
    {
        this._cgl = cgl;
        this.width = width || 8;
        this.height = height || 8;
        this._cubemapProperties = [
            // targets for use in some gl functions for working with cubemaps
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                "lookAt": vec3.fromValues(1.0, 0.0, 0.0),
                "up": vec3.fromValues(0.0, -1.0, 0.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                "lookAt": vec3.fromValues(-1.0, 0.0, 0.0),
                "up": vec3.fromValues(0.0, -1.0, 0.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                "lookAt": vec3.fromValues(0.0, 1.0, 0.0),
                "up": vec3.fromValues(0.0, 0.0, 1.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                "lookAt": vec3.fromValues(0.0, -1.0, 0.0),
                "up": vec3.fromValues(0.0, 0.0, -1.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                "lookAt": vec3.fromValues(0.0, 0.0, 1.0),
                "up": vec3.fromValues(0.0, -1.0, 0.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                "lookAt": vec3.fromValues(0.0, 0.0, -1.0),
                "up": vec3.fromValues(0.0, -1.0, 0.0),
            },
        ];

        this._lookAtTemp = vec3.fromValues(0, 0, 0);
        this.camPos = vec3.fromValues(0, 0, 0);

        this._modelMatrix = mat4.create();
        this._viewMatrix = mat4.create();
        this._projectionMatrix = mat4.perspective(mat4.create(), CGL.DEG2RAD * 90, 1, 0.1, 1000.0);
        this._depthRenderbuffer = null;
        this._framebuffer = null;
        this._depthbuffer = null;
        // this._textureFrameBuffer = null;
        this._textureDepth = null;

        this._options = options || {
            // "isFloatingPointTexture": false
        };

        this.name = this._options.name || "unknown cubemapframebuffer";
        if (!this._options.hasOwnProperty("numRenderBuffers")) this._options.numRenderBuffers = 1;
        if (!this._options.hasOwnProperty("depth")) this._options.depth = true;
        if (!this._options.hasOwnProperty("clear")) this._options.clear = true;
        if (!this._options.hasOwnProperty("multisampling"))
        {
            this._options.multisampling = false;
            this._options.multisamplingSamples = 0;
        }

        if (this._options.multisamplingSamples)
        {
            if (this._cgl.glSlowRenderer) this._options.multisamplingSamples = 0;
            if (!this._cgl.gl.MAX_SAMPLES) this._options.multisamplingSamples = 0;
            else this._options.multisamplingSamples = Math.min(this._cgl.gl.getParameter(this._cgl.gl.MAX_SAMPLES), this._options.multisamplingSamples);
        }

        if (!this._options.hasOwnProperty("filter")) this._options.filter = CGL.Texture.FILTER_LINEAR;
        if (!this._options.hasOwnProperty("wrap")) this._options.wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

        this._cgl.checkFrameStarted("cubemap framebuffer");

        let pxlFormat = options.pixeFormat;
        if (!pxlFormat && options.isFloatingPointTexture)pxlFormat = CGL.Texture.PFORMATSTR_RGBA32F;

        this.texture = new CubemapTexture(this._cgl, {
            "width": this.width,
            "height": this.height,
            "pixelFormat": options.pixelFormat,
            "filter": this._options.filter,
            "wrap": this._options.wrap,
            "name": this.name + " cubemaptexture"
        });

        this.initializeRenderbuffers();
        this.setSize(this.width, this.height);
    }

    initializeRenderbuffers()
    {
        this._framebuffer = this._cgl.gl.createFramebuffer(); // crate the framebuffer that will draw to the reflection map
        this._depthbuffer = this._cgl.gl.createRenderbuffer(); // renderbuffer for depth buffer in framebuffer

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer); // select the framebuffer, so we can attach the depth buffer to it
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer); // so we can create storage for the depthBuffer

        this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this.width, this.height);
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);

        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    }

    getWidth()
    {
        return this.width;
    }

    getHeight()
    {
        return this.height;
    }

    getGlFrameBuffer()
    {
        return this._framebuffer;
    }

    getDepthRenderBuffer()
    {
        return this._depthRenderbuffer;
    }

    getTextureColor()
    {
        return this.texture;
    }

    getTextureDepth()
    {
        return this._textureDepth;
    }

    dispose()
    {
        if (this.texture) this.texture = this.texture.delete();
        if (this._framebuffer) this._cgl.gl.deleteFramebuffer(this._framebuffer);
        if (this._depthRenderbuffer) this._cgl.gl.deleteRenderbuffer(this._depthbuffer);
        // // if (this._textureFrameBuffer) this._cgl.gl.deleteFramebuffer(this._textureFrameBuffer);
    }

    delete()
    {
        this.dispose();
    }

    setSize(width, height)
    {
        // console.log("cubemapframebuffer setsize");
        this._cgl.printError("before cubemap setsize");

        this.width = Math.floor(width);
        this.height = Math.floor(height);
        this.width = Math.min(this.width, this._cgl.maxTexSize);
        this.height = Math.min(this.height, this._cgl.maxTexSize);

        this._cgl.profileData.profileFrameBuffercreate++;

        // if (this._framebuffer) this._cgl.gl.deleteFramebuffer(this._framebuffer);
        // if (this._depthRenderbuffer) this._cgl.gl.deleteRenderbuffer(this._depthbuffer);
        // // if (this._textureFrameBuffer) this._cgl.gl.deleteFramebuffer(this._textureFrameBuffer);

        this._framebuffer = this._cgl.gl.createFramebuffer();
        this._depthbuffer = this._cgl.gl.createRenderbuffer();
        this.texture.setSize(this.width, this.height);

        // this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.texture.tex);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer); // select the framebuffer, so we can attach the depth buffer to it
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer); // so we can create storage for the depthBuffer

        this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this.width, this.height);
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);


        if (!this._cgl.gl.isFramebuffer(this._framebuffer))
        {
            console.error("invalid framebuffer...");
            // throw new Error("Invalid framebuffer");
        }


        // * NOTE: if we check for the error in Safari, we get error code 36059 aka 0x8CDB
        // * NOTE: an error that is found in a WebGL extension (WEBGL_draw_buffers) not supported by most iOS devices
        // * NOTE: see https://gist.github.com/TimvanScherpenzeel/2a604e178013a5ac4b411fbcbfd2fa33
        // * NOTE: also, this error is nowhere to be found in the official WebGL 1 spec
        // if (this._cgl.glVersion !== 1)
        // {
        const status = this._cgl.gl.checkFramebufferStatus(this._cgl.gl.FRAMEBUFFER);
        this.checkErrorsByStatus(status);
        // }

        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);

        this._cgl.printError("cubemap setsize");
    }

    checkErrorsByStatus(status)
    {
        switch (status)
        {
        case this._cgl.gl.FRAMEBUFFER_COMPLETE:
            break;
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            console.error("FRAMEBUFFER_INCOMPLETE_ATTACHMENT...", this.width, this.height, this.texture.tex, this._depthBuffer);
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            console.error("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            console.error("FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
        case this._cgl.gl.FRAMEBUFFER_UNSUPPORTED:
            console.error("FRAMEBUFFER_UNSUPPORTED");
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
        case 0x8CDB:
            console.error("Incomplete: FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER from ext. Or Safari/iOS undefined behaviour.");
            break;
        default:
            console.error("incomplete framebuffer", status);
            console.log(this);
            throw new Error("Incomplete framebuffer: " + status);
        }
    }

    setFilter(filter)
    {
        this.texture.filter = filter;
        this.texture.setSize(this.width, this.height);
    }

    setCamPos(camPos)
    {
        this.camPos = camPos || this.camPos;
    }

    setMatrices(M, V, P)
    {
        this._modelMatrix = M || this._modelMatrix;
        this._viewMatrix = V || this._viewMatrix;
        this._projectionMatrix = P || this._projectionMatrix;
    }

    renderStart()
    {
        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.texture.tex);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer);
        this._cgl.gl.viewport(0, 0, this.width, this.height);
        this._cgl.pushGlFrameBuffer(this._framebuffer);
        this._cgl.pushFrameBuffer(this);
    }

    renderStartCubemapFace(index)
    {
        this._cgl.pushModelMatrix();
        this._cgl.pushViewMatrix();
        this._cgl.pushPMatrix();

        this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cubemapProperties[index].face, this.texture.tex, 0);
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);

        if (this._options.clear)
        {
            this._cgl.gl.clearColor(0, 0, 0, 1);
            this._cgl.gl.clear(this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT);
        }

        this.setMatricesCubemapFace(index);
    }

    setMatricesCubemapFace(index)
    {
        mat4.copy(this._cgl.mMatrix, this._modelMatrix);
        vec3.add(this._lookAtTemp, this.camPos, this._cubemapProperties[index].lookAt);

        mat4.lookAt(this._cgl.vMatrix, this.camPos, this._lookAtTemp, this._cubemapProperties[index].up); // V

        mat4.copy(this._cgl.pMatrix, this._projectionMatrix);
    }

    renderEndCubemapFace()
    {
        this._cgl.popPMatrix();
        this._cgl.popModelMatrix();
        this._cgl.popViewMatrix();
    }

    renderEnd()
    {
        this._cgl.profileData.profileFramebuffer++;

        if (this._cgl.glVersion !== 1)
        {
            this._cgl.gl.bindFramebuffer(this._cgl.gl.READ_FRAMEBUFFER, this._framebuffer);
            // this._cgl.gl.bindFramebuffer(this._cgl.gl.DRAW_FRAMEBUFFER, this._textureFrameBuffer);
            // * NOTE: the line below is commented out because it clears the screen to black after
            // * point light shadow map has been rendered
            // this._cgl.gl.clearBufferfv(this._cgl.gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
        }

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.popGlFrameBuffer());
        this._cgl.popFrameBuffer();

        this._cgl.resetViewPort();
        this.updateMipMap();
    }

    updateMipMap()
    {
        if (!this.texture) return;

        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.texture.tex);
        this.texture.updateMipMap();
        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);
    }
}



;// CONCATENATED MODULE: ./src/corelibs/cgl_cubemapframebuffer/index.js




})();

var __webpack_export_target__ = (CGL = typeof CGL === "undefined" ? {} : CGL);
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;