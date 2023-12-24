declare function makeVideoPlayableInline(video: HTMLVideoElement): void

interface Array<T> {
  /**
   * Makes a shallow copy of the array
   *
   * @return A shallow copy of the array
   */
  clone(): T[]

  /**
   * Checks whether or not the array contains a given element
   *
   * @param element The element for search for
   * @return Whether or not the array contains the given element
   */
  contains(element: any): boolean

  /**
   * Checks whether or not two arrays are the same
   *
   * @param array The array to compare to
   * @return Whether or not the two arrays are the same
   */
  equals(array: any[]): boolean
}

interface IImageCacheItem {
  bitmap: Bitmap
  key: string
  reservationId?: number
  touch: number
}

interface IRequestQueueItem {
  key: string
  value: Bitmap
}

interface Math {
  /**
   * Generate a random integer in the range `(0, max - 1)`
   *
   * @param max The upper boundary (excluded)
   * @return A random integer
   */
  randomInt(max: number): number
}

interface Number {
  /**
   * Get a number whose value is limited to the given range
   *
   * @param min The lower boundary
   * @param max The upper boundary
   * @return A number in the given range
   */
  clamp(min: number, max: number): number

  /**
   * Get a modulo value which is always positive
   *
   * @param num The divisor
   * @return A modulo value
   */
  mod(num: number): number

  /**
   * Makes a number string with leading zeros
   *
   * @param length The length of the output string
   * @return A string with leading zeros
   */
  padZero(length: number): string
}

interface String {
  /**
   * Checks whether or not the string contains a given string
   *
   * @param str The string to search for
   * @return Whether ot not the string contains a given string
   */
  contains(str: string): boolean

  /**
   * Replaces `%1`, `%2`, and so on in the string with the arguments
   *
   * @param args The objects to format
   * @return A formatted string
   */
  format(...args: any[]): string

  /**
   * Makes a number string with leading zeros
   *
   * @param length The length of the output string
   * @return A string with leading zeros
   */
  padZero(length: number): string
}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max((this as unknown as number), min), max)
}

Number.prototype.mod = function(num) {
  return (((this as unknown as number) % num) + num) % num
}

String.prototype.format = function(...args) {
  return this.replace(/%([0-9]+)/g, (s, n) => {
    return args[Number(n) - 1]
  })
}

String.prototype.padZero = function(length) {
  let str = this as unknown as string

  while (str.length < length) {
    str = '0' + str
  }

  return str
}

Number.prototype.padZero = function(length) {
  return String(this).padZero(length)
}

Object.defineProperties(Array.prototype, {
  clone: {
    enumerable: false,
    value: function(this: any[]) {
      return this.slice(0)
    }
  },
  contains: {
    enumerable: false,
    value: function(this: any[], element: any) {
      return this.indexOf(element) >= 0
    }
  },
  equals: {
    enumerable: false,
    value: function(this: any[], array: any[]) {
      if (!array || this.length !== array.length) {
        return false
      }

      for (let i = 0; i < this.length; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
          if (!this[i].equals(array[i])) {
            return false
          }
        } else if (this[i] !== array[i]) {
          return false
        }
      }

      return true
    }
  }
})

String.prototype.contains = function(string) {
  return this.indexOf(string) >= 0
}

Math.randomInt = function(max) {
  return Math.floor(max * Math.random())
}

//------------------------------------------------------------------------------

/** A static class that defines utility methods */
abstract class Utils {
  /** The name of the RPG Maker. This is currently set to `MV`. */
  public static RPGMAKER_NAME = 'MV'

  /** The version of the RPG Maker */
  public static RPGMAKER_VERSION = '2.0.0'

  private static _id = 1
  private static _supportPassiveEvent?: boolean

  /**
   * Checks whether or not the browser can read files in the game folder
   *
   * @return Whether or not the browser can read files in the game folder
   */
  public static canReadGameFiles() {
    let scripts = document.getElementsByTagName('script')

    let lastScript = scripts[scripts.length - 1]
    let xhr = new XMLHttpRequest()

    try {
      xhr.open('GET', lastScript.src)
      xhr.overrideMimeType('text/javascript')
      xhr.send()

      return true
    } catch (err) {
      return false
    }
  }

  public static generateRuntimeId() {
    return Utils._id++
  }

  /**
   * Checks whether or not the current browser is Android Chrome
   *
   * @return Whether or not the current browser is Android Chrome
   */
  public static isAndroidChrome() {
    let agent = navigator.userAgent

    return !!(agent.match(/Android/) && agent.match(/Chrome/))
  }

  /**
   * Checks whether or not the current platform is a mobile device
   *
   * @return Whether or not the current platform is a mobile device
   */
  public static isMobileDevice() {
    let regex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

    return !!navigator.userAgent.match(regex)
  }

  /**
   * Checks whether or not the current browser is mobile Safari
   *
   * @return Whether or not the current browser is mobile Safari
   */
  public static isMobileSafari() {
    let agent = navigator.userAgent

    return !!(
      agent.match(/iPhone|iPad|iPod/)
        && agent.match(/AppleWebKit/)
        && !agent.match('CriOS')
    )
  }

  /**
   * Checks whether or not the current platform is NW.js
   *
   * @return Whether or not the current platform is NW.js
   */
  public static isNwjs() {
    return typeof require === 'function' && typeof process === 'object'
  }

  /**
   * Checks whether or not the option is in the query string
   *
   * @param name The option name
   * @return Whether or not the option is in the query string
   */
  public static isOptionValid(name: string) {
    if (location.search.slice(1).split('&').contains(name)) {
      return true
    }

    if (
      typeof nw !== 'undefined'
        && nw.App.argv.length > 0
        && nw.App.argv[0].split('&').contains(name)
    ) {
      return true
    }

    return false
  }

  /**
   * Test whether or not the current browser supports the passive event feature
   *
   * @return Whether or not the current browser supports the passive event
   *   feature
   */
  public static isSupportPassiveEvent() {
    if (typeof Utils._supportPassiveEvent === 'boolean') {
      return Utils._supportPassiveEvent
    }

    let passive = false

    let options = Object.defineProperty({}, 'passive', {
      get: function() {
        passive = true
      }
    })

    // Ugly hack
    ;(window as any).addEventListener('test', null, options)

    Utils._supportPassiveEvent = passive

    return passive
  }

  /**
   * Makes a CSS color string from RGB values
   *
   * @param r The red value
   * @param g The green value
   * @param b The blue value
   * @return The CSS color string
   */
  public static rgbToCssColor(r: number, g: number, b: number) {
    b = Math.round(b)
    g = Math.round(g)
    r = Math.round(r)

    return `rgb(${r}, ${g}, ${b})`
  }
}

//------------------------------------------------------------------------------

/**
 * The resource class. Allows to be garbage collected if not used for a certain
 * amount of time or ticks.
 */
class CacheEntry {
  public cache: CacheMap
  public cached: boolean
  public freedByTTL: boolean
  public item: string
  public key: string
  public touchSeconds: number
  public touchTicks: number
  public ttlSeconds: number
  public ttlTicks: number

  /**
   * @param cache The resource manager
   * @param key The URL of the resource
   * @param item The item to be stored in the cache
   */
  constructor(cache: CacheMap, key: string, item: string) {
    this.cache = cache
    this.cached = false
    this.freedByTTL = false
    this.item = item
    this.key = key
    this.touchSeconds = 0
    this.touchTicks = 0
    this.ttlSeconds = 0
    this.ttlTicks = 0
  }

  /** Allocates the resource */
  public allocate() {
    if (!this.cached) {
      this.cache._inner[this.key] = this
      this.cached = true
    }

    this.touch()

    return this
  }

  /**
   * Frees the resource
   *
   * @param byTTL Whether or not the resource was freed by TTL
   */
  public free(byTTL?: boolean) {
    this.freedByTTL = byTTL || false

    if (this.cached) {
      this.cached = false

      delete this.cache._inner[this.key]
    }
  }

  public isStillAlive() {
    let cache = this.cache

    return (
      (this.ttlTicks === 0)
        || (this.touchTicks + this.ttlTicks < cache.updateTicks)
    ) && (
      (this.ttlSeconds === 0)
        || (this.touchSeconds + this.ttlSeconds < cache.updateSeconds)
    )
  }

  /**
   * Sets the time to live
   *
   * @param ticks The TTL in ticks
   * @param time The TTL in seconds
   */
  public setTimeToLive(ticks?: number, seconds?: number) {
    this.ttlSeconds = seconds || 0
    this.ttlTicks = ticks || 0

    return this
  }

  /**
   * Makes sure that this this resource won't be freed by TTL. If the resource
   * was already freed by TTL, put it in the cache map again.
   */
  public touch() {
    let cache = this.cache

    if (this.cached) {
      this.touchSeconds = cache.updateSeconds
      this.touchTicks = cache.updateTicks
    } else if (this.freedByTTL) {
      this.freedByTTL = false

      if (!cache._inner[this.key]) {
        cache._inner[this.key] = this
      }
    }
  }
}

//------------------------------------------------------------------------------

/** A cache for images, audio, or any other kind of resource */
class CacheMap {
  public _inner: Record<string, CacheEntry>
  public delayCheckTTL: number
  public lastCheckTTL: number
  public manager: any
  public updateSeconds: number
  public updateTicks: number
  private _lastRemovedEntries: CacheEntry[]

  constructor(manager: any) {
    this._inner = {}
    this._lastRemovedEntries = []
    this.delayCheckTTL = 100.0
    this.lastCheckTTL = 0
    this.manager = manager
    this.updateSeconds = Date.now()
    this.updateTicks = 0
  }

  /** Checks the TTL of all elements and removes dead ones */
  public checkTTL() {
    let cache = this._inner
    let temp = this._lastRemovedEntries

    if (!temp) {
      temp = []

      this._lastRemovedEntries = temp
    }

    for (let key in cache) {
      let entry = cache[key]

      if (!entry.isStillAlive()) {
        temp.push(entry)
      }
    }

    for (let i = 0; i < temp.length; i++) {
      temp[i].free(true)
    }

    temp.length = 0
  }

  public clear() {
    let keys = Object.keys(this._inner)

    for (let i = 0; i < keys.length; i++) {
      this._inner[keys[i]].free()
    }
  }

  /**
   * Get a cached item
   *
   * @param key The URL of the cached element
   */
  public getItem(key: string) {
    let entry = this._inner[key]

    if (entry) {
      return entry.item
    }

    return null
  }

  public setItem(key: string, item: string) {
    return new CacheEntry(this, key, item).allocate()
  }

  public update(ticks: number, delta: number) {
    this.updateSeconds += delta
    this.updateTicks += ticks

    if (this.updateSeconds >= this.delayCheckTTL + this.lastCheckTTL) {
      this.lastCheckTTL = this.updateSeconds

      this.checkTTL()
    }
  }
}

//------------------------------------------------------------------------------

class ImageCache {
  public static limit = 10 * 1000 * 1000
  private _items: Record<string, IImageCacheItem>

  constructor() {
    this._items = {}
  }

  public add(key: string, value: Bitmap) {
    this._items[key] = {
      bitmap: value,
      key,
      touch: Date.now()
    }

    this._truncateCache()
  }

  public get(key: string) {
    if (this._items[key]) {
      let item = this._items[key]
      item.touch = Date.now()

      return item.bitmap
    }

    return null
  }

  public getErrorBitmap() {
    let bitmap: Bitmap | null = null
    let items = this._items

    if (
      Object.keys(items)
        .some(key => {
          if (items[key].bitmap.isError()) {
            bitmap = items[key].bitmap

            return true
          }

          return false
        })
    ) {
      return bitmap!
    }

    return null
  }

  public isReady() {
    let items = this._items

    return !Object.keys(items)
      .some(key => {
        return !items[key].bitmap.isRequestOnly()
          && !items[key].bitmap.isReady()
      })
  }

  public releaseReservation(reservationId: number) {
    let items = this._items

    Object.keys(items)
      .map(key => items[key])
      .forEach(item => {
        if (item.reservationId === reservationId) {
          delete item.reservationId
        }
      })
  }

  public reserve(key: string, value: Bitmap, reservationId: number) {
    if (!this._items[key]) {
      this._items[key] = {
        bitmap: value,
        key,
        touch: Date.now()
      }
    }

    this._items[key].reservationId = reservationId
  }

  private _mustBeHeld(item: IImageCacheItem) {
    if (item.bitmap.isRequestOnly()) { return false }
    if (item.reservationId) { return true }
    if (!item.bitmap.isReady()) { return true }

    return false
  }

  private _truncateCache() {
    let items = this._items
    let sizeLeft = ImageCache.limit

    Object.keys(items)
      .map(key => items[key])
      .sort((a, b) => b.touch - a.touch)
      .forEach(function(this: ImageCache, item: IImageCacheItem) {
        if (sizeLeft > 0 || this._mustBeHeld(item)) {
          let bitmap = item.bitmap
          sizeLeft -= bitmap.height * bitmap.width
        } else {
          delete items[item.key]
        }
      }.bind(this))
  }
}

//------------------------------------------------------------------------------

class RequestQueue {
  private _queue: IRequestQueueItem[]

  constructor() {
    this._queue = []
  }

  public clear() {
    this._queue.splice(0)
  }

  public enqueue(key: string, value: Bitmap) {
    this._queue.push({
      key,
      value
    })
  }

  public raisePriority(key: string) {
    for (let i = 0; i < this._queue.length; i++) {
      let item = this._queue[i]

      if (item.key === key) {
        this._queue.splice(i, 1)
        this._queue.unshift(item)

        break
      }
    }
  }

  public update() {
    if (this._queue.length === 0) { return }

    let top = this._queue[0]

    if (top.value.isRequestReady()) {
      this._queue.shift()

      if (this._queue.length !== 0) {
        this._queue[0].value.startRequest()
      }
    } else {
      top.value.startRequest()
    }
  }
}

//------------------------------------------------------------------------------

/** The point class */
class Point extends PIXI.Point {
  /**
   * @param x The X coordinate
   * @param y The Y coordinate
   */
  constructor(x: number, y: number) {
    super(x, y)
  }
}

//------------------------------------------------------------------------------

/** The rectangle class */
class Rectangle extends PIXI.Rectangle {
  public static emptyRectangle = new Rectangle(0, 0, 0, 0)

  /**
   * @param x The X coordinate for the upper-left corner
   * @param y The Y coordinate for the upper-left corner
   * @param width The width of the rectangle
   * @param height The height of the rectangle
   */
  constructor(x?: number, y?: number, width?: number, height?: number) {
    super(x, y, width, height)
  }
}

//------------------------------------------------------------------------------

/** The basic object that represents an image */
class Bitmap {
  public __baseTexture!: PIXI.BaseTexture

  public __canvas!: HTMLCanvasElement

  public __context!: CanvasRenderingContext2D

  public _decodeAfterRequest!: boolean

  public _defer?: boolean

  public _dirty?: boolean

  public _errorListener?: (() => void) | ((arg0: Bitmap) => void)

  public _image?: HTMLImageElement

  public _loader?: () => void

  public _loadingState!: 'decryptCompleted'
    | 'decrypted'
    | 'decrypting'
    | 'error'
    | 'loaded'
    | 'none'
    | 'pending'
    | 'purged'
    | 'requestCompleted'
    | 'requesting'

  public _loadListener?: (() => void) | ((arg0: Bitmap) => void)

  public _loadListeners!: ((() => void) | ((arg0: Bitmap) => void))[]

  public _paintOpacity!: number

  public static _reuseImages = [] as HTMLImageElement[]

  public _smooth!: boolean

  public _url!: string

  /**
   * The cache entry for images. In all cases, `_url` is the same as
   * `cacheEntry.key`.
   */
  public cacheEntry?: CacheEntry

  /** The name of the font */
  public fontFace!: string

  /** Whether or not the font is italic */
  public fontItalic!: boolean

  /** The size of the font in pixels */
  public fontSize!: number

  /** The color of the outline of the text in CSS format */
  public outlineColor!: string

  /** The width of the outline of the text */
  public outlineWidth!: number

  /** The color of the text in CSS format */
  public textColor!: string

  /**
   * @param width The width of the bitmap
   * @param height The height of the bitmap
   */
  constructor(width?: number, height?: number) {
    this.initialize.apply(this, [width, height])
  }

  public get _baseTexture() {
    if (!this.__baseTexture) {
      this._createBaseTexture(this._image || this.__canvas)
    }

    return this.__baseTexture
  }

  public get _canvas() {
    if (!this.__canvas) { this._createCanvas() }

    return this.__canvas
  }

  public _clearImgInstance() {
    this._image!.onerror = null
    this._image!.onload = null
    this._image!.src = ''
  }

  public get _context() {
    if (!this.__context) { this._createCanvas() }

    return this.__context
  }

  public _createBaseTexture(
    source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement
  ) {
    this.__baseTexture = new PIXI.BaseTexture(source)
    this.__baseTexture.height = source.height
    this.__baseTexture.mipmap = false
    this.__baseTexture.width = source.width

    if (this._smooth) {
      this._baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR
    } else {
      this._baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
    }
  }

  public _createCanvas(width?: number, height?: number) {
    this.__canvas ||= document.createElement('canvas')
    this.__context = this.__canvas.getContext('2d')!

    this.__canvas.height = Math.max(height || 0, 1)
    this.__canvas.width = Math.max(width || 0, 1)

    if (this._image) {
      let h = Math.max(this._image.height || 0, 1)
      let w = Math.max(this._image.width || 0, 1)

      this.__canvas.height = h
      this.__canvas.width = w

      this._createBaseTexture(this._canvas)
      this.__context.drawImage(this._image, 0, 0)
    }

    this._setDirty()
  }

  public _renewCanvas() {
    let newImage = this._image

    if (
      newImage
        && this.__canvas
        && (
          this.__canvas.width < newImage.width
            || this.__canvas.height < newImage.height
        )
    ) {
      this._createCanvas()
    }
  }

  /**
   * Add a callback function that will be called when the bitmap is loaded
   *
   * @param listener The callback function to be called
   */
  public addLoadListener(listener: (() => void) | ((arg0: Bitmap) => void)) {
    if (!this.isReady()) {
      this._loadListeners.push(listener)
    } else {
      listener(this)
    }
  }

  /**
   * Changes the color tone of the entire bitmap
   *
   * @param r The red strength
   * @param g The green strength
   * @param b The blue strength
   */
  public adjustTone(r: number, g: number, b: number) {
    if ((r || g || b) && this.width > 0 && this.height > 0) {
      let context = this._context
      let imageData = context.getImageData(0, 0, this.width, this.height)
      let pixels = imageData.data

      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] += r
        pixels[i + 1] += g
        pixels[i + 2] += b
      }

      context.putImageData(imageData, 0, 0)

      this._setDirty()
    }
  }

  /** The base texture that holds the image */
  public get baseTexture() {
    return this._baseTexture
  }

  /**
   * Performs a block transfer
   *
   * @param source The bitmap to draw
   * @param sx The X coordinate in the source
   * @param sy The Y coordinate in the source
   * @param sw The width of the source image
   * @param sh The height of the source image
   * @param dx The X coordinate in the destination
   * @param dy The Y coordinate in the destination
   * @param dw The width to draw the image in the destination
   * @param dh The height to draw the image in the destination
   */
  public blt(
    source: Bitmap,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw = sw,
    dh = sh
  ) {
    if (
      sx >= 0
        && sy >= 0
        && sw > 0
        && sh > 0
        && dw > 0
        && dh > 0
        && sx + sw <= source.width
        && sy + sh <= source.height
    ) {
      this._context.globalCompositeOperation = 'source-over'

      this._context.drawImage(source._canvas, sx, sy, sw, sh, dx, dy, dw, dh)

      this._setDirty()
    }
  }

  /**
   * Performs a block transfer, using the assumption that the original image was
   * not modified
   *
   * @param source The bitmap to draw
   * @param sx The X coordinate in the source
   * @param sy The Y coordinate in the source
   * @param sw The width of the source image
   * @param sh The height of the source image
   * @param dx The X coordinate in the destination
   * @param dy The Y coordinate in the destination
   * @param dw The width to draw the image in the destination
   * @param dh The height to draw the image in the destination
   */
  public bltImage(
    source: Bitmap,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw = sw,
    dh = sh
  ) {
    if (
      sx >= 0
        && sy >= 0
        && sw > 0
        && sh > 0
        && dw > 0
        && dh > 0
        && sx + sw <= source.width
        && sy + sh <= source.height
    ) {
      this._context.globalCompositeOperation = 'source-over'

      this._context.drawImage(source._image!, sx, sy, sw, sh, dx, dy, dw, dh)

      this._setDirty()
    }
  }

  /** Applies a blur effect to the bitmap */
  public blur() {
    for (let i = 0; i < 2; i++) {
      let canvas = this._canvas
      let context = this._context
      let h = this.height
      let tempCanvas = document.createElement('canvas')
      let tempContext = tempCanvas.getContext('2d')!
      let w = this.width

      tempCanvas.height = h + 2
      tempCanvas.width = w + 2

      tempContext.drawImage(canvas, 0, 0, w, h, 1, 1, w, h)
      tempContext.drawImage(canvas, 0, 0, w, 1, 1, 0, w, 1)
      tempContext.drawImage(canvas, 0, 0, 1, h, 0, 1, 1, h)
      tempContext.drawImage(canvas, 0, h - 1, w, 1, 1, h = 1, w, 1)
      tempContext.drawImage(canvas, w - 1, 0, 1, h, w + 1, 1, 1, h)

      context.save()

      context.fillStyle = 'black'

      context.fillRect(0, 0, w, h)

      context.globalAlpha = 1 / 9
      context.globalCompositeOperation = 'lighter'

      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          context.drawImage(tempCanvas, x, y, w, h, 0, 0, w, h)
        }
      }

      context.restore()
    }

    this._setDirty()
  }

  /** The bitmap canvas */
  public get canvas() {
    return this._canvas
  }

  /** Updates the texture if the bitmap was dirty */
  public checkDirty() {
    if (this._dirty) {
      this._baseTexture.update()

      this._dirty = false
    }
  }

  /** Clears the entire bitmap */
  public clear() {
    this.clearRect(0, 0, this.width, this.height)
  }

  /**
   * Clears the specified rectangle
   *
   * @param x The X coordinate for the upper-left corner
   * @param y The Y coordinate for the upper-left corner
   * @param width The width of the rectangle to clear
   * @param height The height of the rectangle to clear
   */
  public clearRect(x: number, y: number, width: number, height: number) {
    this._context.clearRect(x, y, width, height)

    this._setDirty()
  }

  /** The 2D context of the bitmap canvas */
  public get context() {
    return this._context
  }

  public decode() {
    switch (this._loadingState) {
      case 'decryptCompleted':
      case 'requestCompleted':
        this._loadingState = 'loaded'

        if (!this.__canvas) { this._createBaseTexture(this._image!) }

        this._setDirty()
        this._callLoadListeners()

        break
      case 'decrypting':
      case 'requesting':
        this._decodeAfterRequest = true

        if (!this._loader) {
          this._loader = ResourceHandler.createLoader(
            this._url,
            this._requestImage.bind(this, this._url),
            this._onError.bind(this)
          )
        }

        break
      case 'error':
      case 'pending':
      case 'purged':
        this._decodeAfterRequest = true

        this._requestImage(this._url)

        break
    }
  }

  /**
   * Draw a bitmap in the shape of a circle
   *
   * @param x The X coordinate based on the circle center
   * @param y The Y coordinate based on the circle center
   * @param radius The radius of the circle
   * @param color The color of the circle in CSS format
   */
  public drawCircle(x: number, y: number, radius: number, color: string) {
    let context = this._context

    context.save()

    context.fillStyle = color

    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2, false)
    context.fill()

    context.restore()

    this._setDirty()
  }

  /**
   * Draws the outline text to the bitmap
   *
   * @param text The text that will be drawn
   * @param x The X coordinate for the left of the text
   * @param y The Y coordinate for the top of the text
   * @param maxWidth The maximum allowed width of the text
   * @param lineHeight The height of the the text line
   * @param align The alignment of the text
   */
  public drawText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: CanvasTextAlign
  ) {
    if (text !== undefined) {
      let context = this._context

      let alpha = context.globalAlpha
      let tx = x
      let ty = y + lineHeight - (lineHeight - this.fontSize * 0.7) / 2

      maxWidth = maxWidth || 0xffffffff

      if (align === 'center') {
        tx += maxWidth / 2
      }

      if (align === 'right') {
        tx += maxWidth
      }

      context.save()

      context.font = this._makeFontNameText()
      context.globalAlpha = 1
      context.textAlign = align
      context.textBaseline = 'alphabetic'

      this._drawTextOutline(text, tx, ty, maxWidth)

      context.globalAlpha = alpha

      this._drawTextBody(text, tx, ty, maxWidth)

      context.restore()

      this._setDirty()
    }
  }

  /**
   * Fills the entire bitmap
   *
   * @param color The color of the rectangle in CSS format
   */
  public fillAll(color: string) {
    this.fillRect(0, 0, this.width, this.height, color)
  }

  /**
   * Fills the specified rectangle
   *
   * @param x The X coordinate for the upper-left corner
   * @param y The Y coordinate for the upper-left corner
   * @param width The width of the rectangle to fill
   * @param height The height of the rectangle to fill
   * @param color The color of the rectangle in CSS format
   */
  public fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) {
    let context = this._context

    context.save()

    context.fillStyle = color

    context.fillRect(x, y, width, height)

    context.restore()

    this._setDirty()
  }

  /**
   * Get the alpha value of the pixel at the specified point
   *
   * @param x The X coordinate of the pixel in the bitmap
   * @param y The Y coordinate of the pixel in the bitmap
   * @return The alpha value
   */
  public getAlphaPixel(x: number, y: number) {
    let data = this._context.getImageData(x, y, 1, 1).data

    return data[3]
  }

  /**
   * Get the color at the specified pixel
   *
   * @param x The X coordinate of the pixel in the bitmap
   * @param y The Y coordinate of the pixel in the bitmap
   * @return The color of the pixel in hex format
   */
  public getPixel(x: number, y: number) {
    let data = this._context.getImageData(x, y, 1, 1).data
    let result = '#'

    for (let i = 0; i < 3; i++) {
      result += data[i].toString(16).padZero(2)
    }

    return result
  }

  /**
   * Draws the rectangle with a gradation
   *
   * @param x The X coordinate for the upper-left corner
   * @param y The Y coordinate for the upper-left corner
   * @param width The width of the rectangle to fill
   * @param height The height of the rectangle to fill
   * @param color1 The gradient starting color
   * @param color2 The gradient ending color
   * @param vertical Whether or not the gradient should be drawn vertically or
   *   not
   */
  public gradientFillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color1: string,
    color2: string,
    vertical: boolean
  ) {
    let context = this._context
    let grad: CanvasGradient

    if (vertical) {
      grad = context.createLinearGradient(x, y, x, y + height)
    } else {
      grad = context.createLinearGradient(x, y, x + width, y)
    }

    grad.addColorStop(0, color1)
    grad.addColorStop(1, color2)

    context.save()

    context.fillStyle = grad

    context.fillRect(x, y, width, height)

    context.restore()

    this._setDirty()
  }

  /** The height of the bitmap */
  public get height() {
    if (this.isReady()) {
      return this._image
        ? this._image.height
        : this._canvas.height
    }

    return 0
  }

  public initialize(width?: number, height?: number) {
    if (!this._defer) {
      this._createCanvas(width, height)
    }

    this._decodeAfterRequest = false
    this._loadingState = 'none'
    this._loadListeners = []
    this._paintOpacity = 255
    this._smooth = false
    this._url = ''

    this.fontFace = 'GameFont'
    this.fontItalic = false
    this.fontSize = 28
    this.outlineColor = 'rgba(0, 0, 0, 0.5)'
    this.outlineWidth = 4
    this.textColor = '#fff'
  }

  /**
   * Checks whether or not a loading error has occurred
   *
   * @return Whether or not a loading error has occurred
   */
  public isError() {
    return this._loadingState === 'error'
  }

  /**
   * Checks whether or not the bitmap is ready to render
   *
   * @return Whether or not the bitmap is ready to render
   */
  public isReady() {
    return this._loadingState === 'loaded' || this._loadingState === 'none'
  }

  public isRequestOnly() {
    return !(this._decodeAfterRequest || this.isReady())
  }

  public isRequestReady() {
    return this._loadingState !== 'pending'
      && this._loadingState !== 'requesting'
      && this._loadingState !== 'decrypting'
  }

  /**
   * Loads an image file and returns a new bitmap
   *
   * @param url The image URL of the texture
   */
  public static load(url: string) {
    let bitmap = Object.create(Bitmap.prototype) as Bitmap
    bitmap._defer = true

    bitmap.initialize()

    bitmap._decodeAfterRequest = true

    bitmap._requestImage(url)

    return bitmap
  }

  /**
   * Get the width of the specified text
   *
   * @param text The text to be measured
   * @return The width of the text in pixels
   */
  public measureTextWidth(text: string) {
    let context = this._context

    context.save()

    context.font = this._makeFontNameText()

    let width = context.measureText(text).width

    context.restore()

    return width
  }

  /** The opacity of the drawing object */
  public get paintOpacity() {
    return this._paintOpacity
  }

  public set paintOpacity(value: number) {
    if (this._paintOpacity !== value) {
      this._paintOpacity = value

      this._context.globalAlpha = this._paintOpacity / 255
    }
  }

  /** The rectangle of the bitmap */
  public get rect() {
    return new Rectangle(0, 0, this.width, this.height)
  }

  public static request(url: string) {
    let bitmap = Object.create(Bitmap.prototype) as Bitmap
    bitmap._defer = true

    bitmap.initialize()

    bitmap._loadingState = 'pending'
    bitmap._url = url

    return bitmap
  }

  /**
   * Resizes the bitmap
   *
   * @param width The new width of the bitmap
   * @param height The new height of the bitmap
   */
  public resize(width?: number, height?: number) {
    height = Math.max(height || 0, 1)
    width = Math.max(width || 0, 1)

    this._canvas.height = height
    this._canvas.width = width

    this._baseTexture.height = height
    this._baseTexture.width = width
  }

  /**
   * Rotates the hue of the entire bitmap
   *
   * @param offset The hue offset in 360 degrees
   */
  public rotateHue(offset: number) {
    function hslToRgb(
      h: number,
      s: number,
      l: number
    ): [number, number, number] {
      let c = (255 - Math.abs(2 * l - 255)) * s
      let x = c * (1 - Math.abs((h / 60) % 2 - 1))

      let m = l - c / 2

      let cm = c + m
      let xm = x + m

      if (h < 60) {
        return [cm, xm, m]
      } else if (h < 120) {
        return [xm, cm, m]
      } else if (h < 180) {
        return [m, cm, xm]
      } else if (h < 240) {
        return [m, xm, cm]
      } else if (h < 300) {
        return [xm, m, cm]
      } else {
        return [cm, m, xm]
      }
    }

    function rgbToHsl(
      r: number,
      g: number,
      b: number
    ): [number, number, number] {
      let cmax = Math.max(r, g, b)
      let cmin = Math.min(r, g, b)

      let delta = cmax - cmin
      let h = 0
      let l = (cmax + cmin) / 2
      let s = 0

      if (delta > 0) {
        if (r === cmax) {
          h = 60 * (((g - b) / delta + 6) % 6)
        } else if (g === cmax) {
          h = 60 * ((b - r) / delta + 2)
        } else {
          h = 60 * ((r - g) / delta + 4)
        }

        s = delta / (255 - Math.abs(2 * l - 255))
      }

      return [h, s, l]
    }

    if (offset && this.width > 0 && this.height > 0) {
      offset = ((offset % 360) + 360) % 360

      let context = this._context
      let imageData = context.getImageData(0, 0, this.width, this.height)
      let pixels = imageData.data

      for (let i = 0; i < pixels.length; i += 4) {
        let hsl = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2])

        let h = (hsl[0] + offset) % 360
        let l = hsl[2]
        let s = hsl[1]

        let rgb = hslToRgb(h, s, l)

        pixels[i] = rgb[0]
        pixels[i + 1] = rgb[1]
        pixels[i + 2] = rgb[2]
      }

      context.putImageData(imageData, 0, 0)

      this._setDirty()
    }
  }

  /** Whether or not the smooth scaling is applied */
  public get smooth() {
    return this._smooth
  }

  public set smooth(value: boolean) {
    if (this._smooth !== value) {
      this._smooth = value

      if (this.__baseTexture) {
        if (this._smooth) {
          this._baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR
        } else {
          this._baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST
        }
      }
    }
  }

  /**
   * Takes a snapshot of the game screen and returns a new bitmap object
   *
   * @param stage The stage object
   * @return The snapshot of the game screen
   */
  public static snap(stage?: Stage) {
    let height = Graphics.height
    let width = Graphics.width

    let bitmap = new Bitmap(width, height)
    let context = bitmap._context
    let renderTexture = PIXI.RenderTexture.create(width, height)

    if (stage) {
      Graphics._renderer!.render(stage, renderTexture)
      stage.worldTransform.identity()

      let canvas: HTMLCanvasElement

      if (Graphics.isWebGL()) {
        canvas = Graphics._renderer!.extract.canvas(renderTexture)
      } else {
        canvas = (renderTexture.baseTexture as any)._canvasRenderTarget.canvas
      }

      context.drawImage(canvas, 0, 0)
    }

    renderTexture.destroy(true)
    bitmap._setDirty()

    return bitmap
  }

  public startRequest() {
    if (this._loadingState === 'pending') {
      this._decodeAfterRequest = false

      this._requestImage(this._url)
    }
  }

  /** Touch the resource */
  public touch() {
    if (this.cacheEntry) {
      this.cacheEntry.touch()
    }
  }

  /** The URL of the image file */
  public get url() {
    return this._url
  }

  /** The width of the bitmap */
  public get width() {
    if (this.isReady()) {
      return this._image
        ? this._image.width
        : this._canvas.width
    }

    return 0
  }

  private _callLoadListeners() {
    while (this._loadListeners.length > 0) {
      let listener = this._loadListeners.shift()

      listener!(this)
    }
  }

  private _drawTextBody(
    text: string,
    tx: number,
    ty: number,
    maxWidth?: number
  ) {
    let context = this._context

    context.fillStyle = this.textColor

    context.fillText(text, tx, ty, maxWidth)
  }

  private _drawTextOutline(
    text: string,
    tx: number,
    ty: number,
    maxWidth?: number
  ) {
    let context = this._context

    context.lineJoin = 'round'
    context.lineWidth = this.outlineWidth
    context.strokeStyle = this.outlineColor

    context.strokeText(text, tx, ty, maxWidth)
  }

  private _makeFontNameText() {
    return `${this.fontItalic ? 'Italic' : ''}${this.fontSize}px ${this.fontFace}`
  }

  private _onError() {
    this._image?.removeEventListener('error', (this._errorListener as any)!)
    this._image?.removeEventListener('load', (this._loadListener as any)!)

    this._loadingState = 'error'
  }

  private _onLoad() {
    this._image!.removeEventListener('error', this._errorListener as any)
    this._image!.removeEventListener('load', this._loadListener as any)

    this._renewCanvas()

    switch (this._loadingState) {
      case 'decrypting':
        URL.revokeObjectURL(this._image!.src)

        this._loadingState = 'decryptCompleted'

        if (this._decodeAfterRequest) {
          this.decode()
        } else {
          this._loadingState = 'purged'

          this._clearImgInstance()
        }

        break
      case 'requesting':
        this._loadingState = 'requestCompleted'

        if (this._decodeAfterRequest) {
          this.decode()
        } else {
          this._loadingState = 'purged'

          this._clearImgInstance()
        }

        break
    }
  }

  private _requestImage(url: string) {
    if (Bitmap._reuseImages.length !== 0) {
      this._image = Bitmap._reuseImages.pop()
    } else {
      this._image = new Image()
    }

    if (this._decodeAfterRequest && !this._loader) {
      this._loader = ResourceHandler.createLoader(
        url,
        this._requestImage.bind(this, url),
        this._onError.bind(this)
      )
    }

    this._loadingState = 'requesting'
    this._image = new Image()
    this._url = url

    if (!Decrypter.checkImgIgnore(url) && Decrypter.hasEncryptedImages) {
      this._loadingState = 'decrypting'

      Decrypter.decryptImg(url, this)
    } else {
      this._image.src = url

      this._image.addEventListener(
        'error',
        this._errorListener = this._loader
          || Bitmap.prototype._onError.bind(this)
      )

      this._image.addEventListener(
        'load',
        this._loadListener = Bitmap.prototype._onError.bind(this)
      )
    }
  }

  private _setDirty() {
    this._dirty = true
  }
}

//------------------------------------------------------------------------------

/** The static class that carries out graphics processing */
abstract class Graphics {
  public static _boxHeight: number
  public static _boxWidth: number
  public static _canUseDifferenceBlend: boolean
  public static _canUseSaturationBlend: boolean
  public static _canvas: HTMLCanvasElement
  public static _cssFontLoading = !!(document.fonts && document.fonts.ready)
  public static _errorPrinter: HTMLElement
  public static _errorShowed: boolean
  public static _fontLoaded: FontFaceSet
  public static _fpsMeter: FPSMeter
  public static _fpsMeterToggled: boolean
  public static _height: number
  public static _hiddenCanvas: HTMLCanvasElement
  public static _loadingCount: number
  public static _loadingImage: HTMLImageElement
  public static _maxSkip: number
  public static _modeBox: HTMLDivElement
  public static _realScale: number
  public static _rendered: boolean
  public static _renderer?: PIXI.CanvasRenderer | PIXI.WebGLRenderer
  public static _rendererType: 'auto' | 'canvas' | 'webgl'
  public static _scale: number
  public static _skipCount: number
  public static _stretchEnabled: boolean
  public static _upperCanvas: HTMLCanvasElement
  public static _video: HTMLVideoElement
  public static _videoLoader: () => void
  public static _videoLoading: boolean
  public static _videoUnlocked: boolean
  public static _videoVolume = 1
  public static _width: number

  /** An alias of `PIXI.blendModes.ADD` */
  public static BLEND_ADD = 1

  /** An alias of `PIXI.blendModes.MULTIPLY` */
  public static BLEND_MULTIPLY = 2

  /** An alias of `PIXI.blendModes.NORMAL` */
  public static BLEND_NORMAL = 0

  /** An alias of `PIXI.blendModes.SCREEN` */
  public static BLEND_SCREEN = 3

  /** The total frame count of the game screen */
  public static frameCount = 0

  public static _setupCssFontLoading() {
    if (Graphics._cssFontLoading) {
      document.fonts.ready.then(fonts => {
        Graphics._fontLoaded = fonts
      }).catch(err => {
        // SceneManager.onError(err)
      })
    }
  }

  /** The height of the window display area */
  public static get boxHeight() {
    return this._boxHeight
  }

  public static set boxHeight(value: number) {
    this._boxHeight = value
  }

  /** The width of the window display area */
  public static get boxWidth() {
    return this._boxWidth
  }

  public static set boxWidth(value: number) {
    this._boxWidth = value
  }

  /** Call the PIXI.js garbage collector */
  public static callGC() {
    if (Graphics.isWebGL()) {
      (Graphics._renderer as PIXI.WebGLRenderer).textureGC!.run()
    }
  }

  /**
   * Checks whether or not the browser can play the specified video type
   *
   * @param type The video type to test support for
   * @return Whether or not the browser can play the specified video type
   */
  public static canPlayVideoType(type: string) {
    return this._video && this._video.canPlayType(type)
  }

  public static canUseCssFontLoading() {
    return !!this._cssFontLoading
  }

  /**
   * Checks whether or not the canvas blend mode `difference` is supported
   *
   * @return Whether or not the canvas blend mode `difference` is supported
   */
  public static canUseDifferenceBlend() {
    return this._canUseDifferenceBlend
  }

  /**
   * Checks whether or not the canvas blend mode `saturation` is supported
   *
   * @return Whether or not the canvas blend mode `saturation` is supported
   */
  public static canUseSaturationBlend() {
    return this._canUseSaturationBlend
  }

  /** Erases the "Now Loading" image */
  public static endLoading() {
    this._clearUpperCanvas()

    this._upperCanvas.style.opacity = '0'
  }

  /** Erases the loading error text */
  public static eraseLoadingError() {
    if (this._errorPrinter && !this._errorShowed) {
      this._errorPrinter.innerHTML = ''

      this.startLoading()
    }
  }

  /**
   * Checks whether or not the current browser supports WebGL
   *
   * @return Whether or not the current browser supports WebGL
   */
  public static hasWebGL() {
    try {
      let canvas = document.createElement('canvas')

      return !!(
        canvas.getContext('webgl')
          || canvas.getContext('experimental-webgl')
      )
    } catch (err) {
      return false
    }
  }

  /** The height of the game screen */
  public static get height() {
    return this._height
  }

  public static set height(value: number) {
    if (this._height !== value) {
      this._height = value

      this._updateAllElements()
    }
  }

  /** Hides the FPSMeter element */
  public static hideFps() {
    if (this._fpsMeter) {
      this._fpsMeter.hide()

      this._modeBox.style.opacity = '0'
    }
  }

  /**
   * Initializes the graphics system
   *
   * @param width The width of the game screen
   * @param height The height of the game screen
   * @param type The type of the renderer
   */
  public static initialize(
    width?: number,
    height?: number,
    type?: 'auto' | 'canvas' | 'webgl'
  ) {
    this._height = height || 600
    this._rendererType = type || 'auto'
    this._width = width || 800

    this._boxHeight = this._height
    this._boxWidth = this._width

    this._realScale = 1
    this._scale = 1

    this._canUseDifferenceBlend = false
    this._canUseSaturationBlend = false
    this._errorShowed = false
    this._fpsMeterToggled = false
    this._loadingCount = 0
    this._maxSkip = 3
    this._rendered = false
    this._skipCount = 0
    this._stretchEnabled = this._defaultStretchMode()
    this._videoLoading = false
    this._videoUnlocked = false

    this._testCanvasBlendModes()
    this._modifyExistingElements()
    this._updateRealScale()
    this._createAllElements()
    this._disableTextSelection()
    this._disableContextMenu()
    this._setupEventHandlers()
    this._setupCssFontLoading()
  }

  /**
   * Checks whether or not the font file is loaded
   *
   * @param name The name of the font
   * @return Whether or not the font file is loaded
   */
  public static isFontLoaded(name: string) {
    if (Graphics._cssFontLoading) {
      if (Graphics._fontLoaded) {
        return Graphics._fontLoaded.check(`10px '${name}'`)
      }

      return false
    } else {
      if (!this._hiddenCanvas) {
        this._hiddenCanvas = document.createElement('canvas')
      }

      let context = this._hiddenCanvas.getContext('2d')!
      let text = 'abcdefghijklmnopqrstuvwxyz'
      let width1: number
      let width2: number

      context.font = `40px ${name}, sans-serif`

      width1 = context.measureText(text).width

      context.font = '40px sans-serif'

      width2 = context.measureText(text).width

      return width1 !== width2
    }
  }

  /**
   * Checks whether or not the specified point is inside the game canvas area
   *
   * @param x The X coordinate on the canvas area
   * @param y The Y coordinate on the canvas area
   * @return Whether or not the specified point is inside the game canvas area
   */
  public static isInsideCanvas(x: number, y: number) {
    return (x >= 0 && x < this._width && y >= 0 && y < this._height)
  }

  /**
   * Checks whether or not the video is playing
   *
   * @return Whether or not the video is playing
   */
  public static isVideoPlaying() {
    return this._videoLoading || this._isVideoVisible()
  }

  /**
   * Checks whether or not the renderer type is WebGL
   *
   * @return Whether or not the renderer type is WebGL
   */
  public static isWebGL() {
    return this._renderer && this._renderer.type === PIXI.RENDERER_TYPE.WEBGL
  }

  /**
   * Loads a font file
   *
   * @param name The name of the font
   * @param url The URL of the font file
   */
  public static loadFont(name: string, url: string) {
    let head = document.getElementsByTagName('head')
    let style = document.createElement('style')
    style.type = 'text/css'

    let rule = `@font-face { font-family: '${name}'; src: url('${url}'); }`

    head.item(0)?.appendChild(style)
    style.sheet?.insertRule(rule, 0)

    this._createFontLoader(name)
  }

  /**
   * Converts an X coordinate on the page to the corresponding X coordinate on
   * the canvas area
   *
   * @param x The X coordinate on the page to be converted
   * @return The X coordinate on the canvas area
   */
  public static pageToCanvasX(x: number) {
    if (this._canvas) {
      let left = this._canvas.offsetLeft

      return Math.round((x - left) / this._realScale)
    }

    return 0
  }

  /**
   * Converts a Y coordinate on the page to the corresponding Y coordinate on
   * the canvas area
   *
   * @param y The Y coordinate on the page to be converted
   * @return The Y coordinate on the canvas area
   */
  public static pageToCanvasY(y: number) {
    if (this._canvas) {
      let top = this._canvas.offsetTop

      return Math.round((y - top) / this._realScale)
    }

    return 0
  }

  /**
   * Starts the playback of a video
   *
   * @param src The URL of the video source
   */
  public static playVideo(src: string) {
    this._videoLoader = ResourceHandler.createLoader(
      undefined,
      this._playVideo.bind(this, src),
      this._onVideoError.bind(this)
    )

    this._playVideo(src)
  }

  /**
   * Displays the error text to the screen
   *
   * @param name The name of the error
   * @param message The message of the error
   */
  public static printError(name: string, message: string) {
    this._errorShowed = true

    if (this._errorPrinter) {
      this._errorPrinter.innerHTML = this._makeErrorHtml(name, message)
    }

    this._applyCanvasFilter()
    this._clearUpperCanvas()
  }

  /**
   * Displays the loading error text to the screen
   *
   * @param url The URL of the resource that failed to load
   */
  public static printLoadingError(url: string) {
    if (this._errorPrinter && !this._errorShowed) {
      this._errorPrinter.innerHTML = this._makeErrorHtml(
        'Loading Error',
        `Failed to load: ${url}`
      )

      let button = document.createElement('button')
      button.innerHTML = 'Retry'
      button.style.backgroundColor = 'black'
      button.style.color = 'white'
      button.style.fontSize = '24px'

      button.onmousedown = button.ontouchstart = (ev: Event) => {
        ResourceHandler.retry()

        ev.stopPropagation()
      }

      this._errorPrinter.appendChild(button)

      this._loadingCount = -Infinity
    }
  }

  /**
   * Renders the stage to the game screen
   *
   * @param stage The stage object to be rendered
   */
  public static render(stage?: Stage) {
    if (this._skipCount === 0) {
      let startTime = Date.now()

      if (stage) {
        this._renderer!.render(stage)

        if ((this._renderer as any).gl && (this._renderer as any).gl.flush) {
          (this._renderer as PIXI.WebGLRenderer).gl.flush()
        }
      }

      let endTime = Date.now()

      let elapsedTime = endTime - startTime

      this._skipCount = Math.min(Math.floor(elapsedTime / 15), this._maxSkip)

      this._rendered = true
    } else {
      this._skipCount--

      this._rendered = false
    }

    this.frameCount++
  }

  /** The zoom scale of the game screen */
  public static get scale() {
    return this._scale
  }

  public static set scale(value: number) {
    if (this._scale !== value) {
      this._scale = value

      this._updateAllElements()
    }
  }

  /**
   * Sets the source of the "Now Loading" image
   *
   * @param src The URL of the source image
   */
  public static setLoadingImage(src: string) {
    this._loadingImage = new Image()
    this._loadingImage.src = src
  }

  /** Sets the volume of a video */
  public static setVideoVolume(value: number) {
    this._videoVolume = value

    if (this._video) {
      this._video.volume = this._videoVolume
    }
  }

  /** Shows the FPSMeter element */
  public static showFps() {
    if (this._fpsMeter) {
      this._fpsMeter.show()

      this._modeBox.style.opacity = '1'
    }
  }

  /** Initializes the counter for displaying the "Now Loading" image */
  public static startLoading() {
    this._loadingCount = 0
  }

  /** Marks the end of each frame for FPSMeter */
  public static tickEnd() {
    if (this._fpsMeter && this._rendered) {
      this._fpsMeter.tick()
    }
  }

  /**
   * Increments the loading counter and displays the "Now Loading" image if
   * necessary
   */
  public static updateLoading() {
    this._loadingCount++

    this._paintUpperCanvas()

    this._upperCanvas.style.opacity = '1'
  }

  /** The width of the game screen */
  public static get width() {
    return this._width
  }

  public static set width(value: number) {
    if (this._width !== value) {
      this._width = value

      this._updateAllElements()
    }
  }

  private static _applyCanvasFilter() {
    if (this._canvas) {
      this._canvas.style.filter = 'blur(8px)'
      this._canvas.style.opacity = '0.5'
      this._canvas.style.webkitFilter = 'blur(8px)'
    }
  }

  private static _cancelFullScreen() {
    if ((document as any).cancelFullScreen) {
      (document as any).cancelFullScreen()
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen()
    } else if ((document as any).webkitCancelFullScreen) {
      (document as any).webkitCancelFullScreen()
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen()
    }
  }

  private static _centerElement(element: HTMLElement) {
    let height = (element as any).height * this._realScale
    let width = (element as any).width * this._realScale

    element.style.bottom = '0'
    element.style.height = `${height}px`
    element.style.left = '0'
    element.style.margin = 'auto'
    element.style.position = 'absolute'
    element.style.right = '0'
    element.style.top = '0'
    element.style.width = `${width}px`
  }

  private static _clearUpperCanvas() {
    let context = this._upperCanvas.getContext('2d')!

    context.clearRect(0, 0, this._width, this._height)
  }

  private static _createAllElements() {
    this._createErrorPrinter()
    this._createCanvas()
    this._createVideo()
    this._createUpperCanvas()
    this._createRenderer()
    this._createFPSMeter()
    this._createModeBox()
    this._createGameFontLoader()
  }

  private static _createCanvas() {
    this._canvas = document.createElement('canvas')
    this._canvas.id = 'GameCanvas'

    this._updateCanvas()

    document.body.appendChild(this._canvas)
  }

  private static _createErrorPrinter() {
    this._errorPrinter = document.createElement('p')
    this._errorPrinter.id = 'ErrorPrinter'

    this._updateErrorPrinter()

    document.body.appendChild(this._errorPrinter)
  }

  public static _createFontLoader(name: string) {
    let div = document.createElement('div')
    let text = document.createTextNode('.')

    div.style.color = 'transparent'
    div.style.fontFamily = name
    div.style.fontSize = '0'
    div.style.height = '1px'
    div.style.left = '0'
    div.style.margin = 'auto'
    div.style.position = 'absolute'
    div.style.top = '0'
    div.style.width = '1px'

    div.appendChild(text)
    document.body.appendChild(div)
  }

  private static _createFPSMeter() {
    let options = {
      decimals: 0,
      graph: 1,
      theme: 'transparent'
    } satisfies FPSMeterOptions

    this._fpsMeter = new FPSMeter(undefined, options)

    this._fpsMeter.hide()
  }

  private static _createGameFontLoader() {
    this._createFontLoader('GameFont')
  }

  private static _createModeBox() {
    let box = document.createElement('div')
    box.id = 'modeTextBack'
    box.style.background = 'rgba(0, 0, 0, 0.2)'
    box.style.height = '58px'
    box.style.left = '5px'
    box.style.opacity = '0'
    box.style.position = 'absolute'
    box.style.top = '5px'
    box.style.width = '119px'
    box.style.zIndex = '9'

    let text = document.createElement('div')
    text.id = 'modeText'
    text.innerHTML = this.isWebGL() ? 'WebGL mode' : 'Canvas mode'
    text.style.color = 'white'
    text.style.fontFamily = 'monospace'
    text.style.fontSize = '12px'
    text.style.left = '0'
    text.style.position = 'absolute'
    text.style.textAlign = 'center'
    text.style.textShadow = '1px 1px 0 rgba(0, 0, 0, 0.5)'
    text.style.top = '41px'
    text.style.width = '119px'

    document.body.appendChild(box)
    box.appendChild(text)

    this._modeBox = box
  }

  private static _createRenderer() {
    (PIXI as any).dontSayHello = true

    let height = this._height
    let options = { view: this._canvas } satisfies PIXI.RendererOptions
    let width = this._width

    try {
      switch (this._rendererType) {
        case 'canvas':
          this._renderer = new PIXI.CanvasRenderer(width, height, options)

          break
        case 'webgl':
          this._renderer = new PIXI.WebGLRenderer(width, height, options)

          break
        default:
          this._renderer = PIXI.autoDetectRenderer(width, height, options)

          break
      }

      if (this._renderer && (this._renderer as PIXI.WebGLRenderer).textureGC) {
        (this._renderer as PIXI.WebGLRenderer).textureGC!.maxIdle = 1
      }
    } catch (err) {
      this._renderer = undefined
    }
  }

  private static _createUpperCanvas() {
    this._upperCanvas = document.createElement('canvas')
    this._upperCanvas.id = 'UpperCanvas'

    this._updateUpperCanvas()

    document.body.appendChild(this._upperCanvas)
  }

  private static _createVideo() {
    this._video = document.createElement('video')
    this._video.id = 'GameVideo'
    this._video.style.opacity = '0'

    this._video.setAttribute('playsinline', '')

    this._video.volume = this._videoVolume

    this._updateVideo()

    makeVideoPlayableInline(this._video)

    document.body.appendChild(this._video)
  }

  private static _defaultStretchMode() {
    return Utils.isNwjs() || Utils.isMobileDevice()
  }

  private static _disableContextMenu() {
    let elements =
      document.body.getElementsByTagName('*') as HTMLCollectionOf<HTMLElement>

    let oncontextmenu = () => false

    for (let i = 0; i < elements.length; i++) {
      elements[i].oncontextmenu = oncontextmenu
    }
  }

  private static _disableTextSelection() {
    let body = document.body

    ;(body.style as any).mozUserSelect = 'none'
    ;(body.style as any).msUserSelect = 'none'
    body.style.userSelect = 'none'
    body.style.webkitUserSelect = 'none'
  }

  private static _isFullScreen() {
    return (
      (document.fullscreenElement && document.fullscreenElement !== null)
        || (
          !(document as any).mozFullScreen
            && !(document as any).webkitFullscreenElement
            && !(document as any).msFullscreenElement
        )
    )
  }

  private static _isVideoVisible() {
    return parseInt(this._video.style.opacity) > 0
  }

  private static _makeErrorHtml(name: string, message: string) {
    return `<font color="yellow"><b>${name}</b></font><br /><font color="white">${message}</font><br />`
  }

  private static _modifyExistingElements() {
    let elements =
      document.getElementsByTagName('*') as HTMLCollectionOf<HTMLElement>

    for (let i = 0; i < elements.length; i++) {
      if (parseInt(elements[i].style.zIndex) > 0) {
        elements[i].style.zIndex = '0'
      }
    }
  }

  private static _onKeyDown(ev: KeyboardEvent) {
    if (!ev.ctrlKey && !ev.altKey) {
      switch (ev.keyCode) {
        case 113:
          ev.preventDefault()

          this._switchFPSMeter()

          break
        case 114:
          ev.preventDefault()

          this._switchStretchMode()

          break
        case 115:
          ev.preventDefault()

          this._switchFullScreen()

          break
      }
    }
  }

  private static _onTouchEnd(ev: TouchEvent) {
    if (!this._videoUnlocked) {
      this._video.play()

      this._videoUnlocked = true
    }

    if (this._isVideoVisible() && this._video.paused) {
      this._video.play()
    }
  }

  private static _onVideoEnd() {
    this._updateVisibility(false)
  }

  private static _onVideoError() {
    this._updateVisibility(false)

    this._videoLoading = false
  }

  private static _onVideoLoad() {
    this._video.play()

    this._updateVisibility(true)

    this._videoLoading = false
  }

  private static _onWindowResize() {
    this._updateAllElements()
  }

  private static _paintUpperCanvas() {
    this._clearUpperCanvas()

    if (this._loadingImage && this._loadingCount >= 20) {
      let alpha = ((this._loadingCount - 20) / 30).clamp(0, 1)
      let context = this._upperCanvas.getContext('2d')!
      let dx = (this._width - this._loadingImage.width) / 2
      let dy = (this._height - this._loadingImage.height) / 2

      context.save()

      context.globalAlpha = alpha

      context.drawImage(this._loadingImage, dx, dy)
      context.restore()
    }
  }

  private static _playVideo(src: string) {
    this._video.onended = this._onVideoEnd.bind(this)
    this._video.onerror = this._videoLoader
    this._video.onloadeddata = this._onVideoLoad.bind(this)
    this._video.src = src

    this._video.load()

    this._videoLoading = true
  }

  private static _requestFullScreen() {
    let element = document.body

    if (element.requestFullscreen as any) {
      element.requestFullscreen()
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen()
    } else if ((element as any).webkitRequestFullScreen) {
      (element as any).webkitRequestFullScreen(
        (Element as any).ALLOW_KEYBOARD_INPUT
      )
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen()
    }
  }

  private static _setupEventHandlers() {
    window.addEventListener('resize', this._onWindowResize.bind(this))
    document.addEventListener('keydown', this._onKeyDown.bind(this))
    document.addEventListener('keydown', this._onTouchEnd.bind(this) as any)
    document.addEventListener('mousedown', this._onTouchEnd.bind(this) as any)
    document.addEventListener('touchend', this._onTouchEnd.bind(this))
  }

  private static _switchFPSMeter() {
    if ((this._fpsMeter as any).isPaused) {
      this.showFps()

      this._fpsMeter.showFps()

      this._fpsMeterToggled = false
    } else if (!this._fpsMeterToggled) {
      this._fpsMeter.showDuration()

      this._fpsMeterToggled = true
    } else {
      this.hideFps()
    }
  }

  private static _switchFullScreen() {
    if (this._isFullScreen()) {
      this._requestFullScreen()
    } else {
      this._cancelFullScreen()
    }
  }

  private static _switchStretchMode() {
    this._stretchEnabled = !this._stretchEnabled

    this._updateAllElements()
  }

  private static _testCanvasBlendModes() {
    let canvas = document.createElement('canvas')
    canvas.height = 1
    canvas.width = 1

    let context = canvas.getContext('2d')!
    context.fillStyle = 'white'
    context.globalCompositeOperation = 'source-over'

    context.fillRect(0, 0, 1, 1)

    context.fillStyle = 'white'
    context.globalCompositeOperation = 'difference'

    context.fillRect(0, 0, 1, 1)

    let imageData1 = context.getImageData(0, 0, 1, 1)

    context.fillStyle = 'black'
    context.globalCompositeOperation = 'source-over'

    context.fillRect(0, 0, 1, 1)

    context.fillStyle = 'white'
    context.globalCompositeOperation = 'saturation'

    context.fillRect(0, 0, 1, 1)

    let imageData2 = context.getImageData(0, 0, 1, 1)

    this._canUseDifferenceBlend = imageData1.data[0] === 0
    this._canUseSaturationBlend = imageData2.data[0] === 0
  }

  private static _updateAllElements() {
    this._updateRealScale()
    this._updateErrorPrinter()
    this._updateCanvas()
    this._updateVideo()
    this._updateUpperCanvas()
    this._updateRenderer()
    this._paintUpperCanvas()
  }

  private static _updateCanvas() {
    this._canvas.height = this._height
    this._canvas.style.zIndex = '1'
    this._canvas.width = this._width

    this._centerElement(this._canvas)
  }

  private static _updateErrorPrinter() {
    (this._errorPrinter as any).height = 40
    this._errorPrinter.style.fontSize = '20px'
    this._errorPrinter.style.textAlign = 'center'
    this._errorPrinter.style.textShadow = '1px 1px 3px #000'
    this._errorPrinter.style.zIndex = '99'
    ;(this._errorPrinter as any).width = this._width * 0.9

    this._centerElement(this._errorPrinter)
  }

  private static _updateRealScale() {
    if (this._stretchEnabled) {
      let h = window.innerWidth / this._width
      let v = window.innerHeight / this._height

      if (h >= 1 && h - 0.01 <= 1) { h = 1 }
      if (v >= 1 && v - 0.01 <= 1) { v = 1 }

      this._realScale = Math.min(h, v)
    } else {
      this._realScale = this._scale
    }
  }

  private static _updateRenderer() {
    if (this._renderer) {
      this._renderer.resize(this._width, this._height)
    }
  }

  private static _updateUpperCanvas() {
    this._upperCanvas.height = this._height
    this._upperCanvas.style.zIndex = '3'
    this._upperCanvas.width = this._width

    this._centerElement(this._upperCanvas)
  }

  private static _updateVideo() {
    this._video.height = this._height
    this._video.style.zIndex = '2'
    this._video.width = this._width

    this._centerElement(this._video)
  }

  private static _updateVisibility(videoVisible: boolean) {
    this._canvas.style.opacity = videoVisible ? '0' : '1'
    this._video.style.opacity = videoVisible ? '1' : '0'
  }
}

//------------------------------------------------------------------------------

/** The static class that handles input data from the keyboard and gamepads */
abstract class Input {
  /** A hash table to convert from a gamepad button to a mapped key name */
  public static gamepadMapper = {
    0: 'ok',
    1: 'cancel',
    2: 'shift',
    3: 'menu',
    4: 'pageup',
    5: 'pagedown',
    12: 'up',
    13: 'down',
    14: 'left',
    15: 'right'
  } as Record<number, string>

  /** A hash table to convert from a virtual key code to a mapped key name */
  public static keyMapper = {
    9: 'tab',
    13: 'ok',
    16: 'shift',
    17: 'control',
    18: 'control',
    27: 'escape',
    32: 'ok',
    33: 'pageup',
    34: 'pagedown',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    45: 'escape',
    81: 'pageup',
    87: 'pagedown',
    88: 'escape',
    90: 'ok',
    96: 'escape',
    98: 'down',
    100: 'left',
    102: 'right',
    104: 'up',
    120: 'debug'
  } as Record<number, string>

  /** The interval of the key repeat in frames */
  public static keyRepeatInterval = 6

  /** The wait time of the key repeat in frames */
  public static keyRepeatWait = 24

  private static _currentState: Record<string, boolean>
  private static _date: number
  private static _dir4: number
  private static _dir8: number
  private static _gamepadStates: boolean[][]
  private static _latestButton?: string
  private static _preferredAxis: string
  private static _pressedTime: number
  private static _previousState: Record<string, boolean>

  /** Clears all the input data */
  public static clear() {
    this._dir4 = 0
    this._dir8 = 0
    this._currentState = {}
    this._date = 0
    this._gamepadStates = []
    this._preferredAxis = ''
    this._pressedTime = 0
    this._previousState = {}

    delete this._latestButton
  }

  /** The time of the last input in milliseconds */
  public static get date() {
    return this._date
  }

  /** The four direction value as a number of the numpad, or `0` for neutral */
  public static get dir4() {
    return this._dir4
  }

  /** The eight direction value as a number of the numpad, or `0` for neutral */
  public static get dir8() {
    return this._dir8
  }

  /** Initializes the input system */
  public static initialize() {
    this.clear()
    this._wrapNwjsAlert()
    this._setupEventHandlers()
  }

  /**
   * Checks whether or not a key is long-pressed
   *
   * @param keyName The mapped name of the key
   * @return Whether or not a key is long-pressed
   */
  public static isLongPressed(keyName: string) {
    if (this._isEscapeCompatible(keyName) && this.isLongPressed('escape')) {
      return true
    } else {
      return (
        this._latestButton === keyName
          && this._pressedTime >= this.keyRepeatWait
      )
    }
  }

  /**
   * Checks whether or not a key is currently pressed down
   *
   * @param keyName The mapped name of the key
   * @return Whether or not the key is pressed
   */
  public static isPressed(keyName: string) {
    if (this._isEscapeCompatible(keyName) && this.isPressed('escape')) {
      return true
    } else {
      return !!this._currentState[keyName]
    }
  }

  /**
   * Checks whether or not a key was just triggered or a key repeat occurred
   *
   * @param keyName The mapped name of the key
   * @return Whether or not the key was repeated
   */
  public static isRepeated(keyName: string) {
    if (this._isEscapeCompatible(keyName) && this.isRepeated('escape')) {
      return true
    } else {
      return (
        this._latestButton === keyName
          && (
            this._pressedTime === 0
              || (
                this._pressedTime >= this.keyRepeatWait
                  && this._pressedTime % this.keyRepeatInterval === 0
              )
          )
      )
    }
  }

  /**
   * Checks whether or not a key was just triggered
   *
   * @param keyName The mapped name of the key
   * @return Whether or not the key was just triggered
   */
  public static isTriggered(keyName: string) {
    if (this._isEscapeCompatible(keyName) && this.isTriggered('escape')) {
      return true
    } else {
      return this._latestButton === keyName && this._pressedTime === 0
    }
  }

  /** Updates the input data */
  public static update() {
    this._pollGamepads()

    if (this._currentState[this._latestButton!]) {
      this._pressedTime++
    } else {
      delete this._latestButton
    }

    for (let name in this._currentState) {
      if (this._currentState[name] && !this._previousState[name]) {
        this._date = Date.now()
        this._latestButton = name
        this._pressedTime = 0
      }

      this._previousState[name] = this._currentState[name]
    }

    this._updateDirection()
  }

  private static _isEscapeCompatible(keyName: string) {
    return keyName === 'cancel' || keyName === 'menu'
  }

  private static _makeNumpadDirection(x: number, y: number) {
    if (x !== 0 || y !== 0) {
      return 5 - y * 3 + x
    }

    return 0
  }

  private static _onKeyDown(ev: KeyboardEvent) {
    if (this._shouldPreventDefault(ev.keyCode)) {
      ev.preventDefault()
    }

    if (ev.keyCode === 144) {
      this.clear()
    }

    let buttonName = this.keyMapper[ev.keyCode]

    if (ResourceHandler.exists() && buttonName === 'ok') {
      ResourceHandler.retry()
    } else if (buttonName) {
      this._currentState[buttonName] = true
    }
  }

  private static _onKeyUp(ev: KeyboardEvent) {
    let buttonName = this.keyMapper[ev.keyCode]

    if (buttonName) {
      this._currentState[buttonName] = false
    }

    if (ev.keyCode === 0) {
      this.clear()
    }
  }

  private static _onLostFocus() {
    this.clear()
  }

  private static _pollGamepads() {
    if (navigator.getGamepads as any) {
      let gamepads = navigator.getGamepads()

      if (gamepads) {
        for (let i = 0; i < gamepads.length; i++) {
          let gamepad = gamepads[i]

          if (gamepad && gamepad.connected) {
            this._updateGamepadState(gamepad)
          }
        }
      }
    }
  }

  private static _setupEventHandlers() {
    document.addEventListener('keydown', this._onKeyDown.bind(this))
    document.addEventListener('keyup', this._onKeyUp.bind(this))
    window.addEventListener('blur', this._onLostFocus.bind(this))
  }

  private static _shouldPreventDefault(keyCode: number) {
    switch (keyCode) {
      case 8:
      case 33:
      case 34:
      case 37:
      case 38:
      case 39:
      case 40:
        return true
      default:
        return false
    }
  }

  private static _signX() {
    let x = 0

    if (this.isPressed('left')) {
      x--
    }

    if (this.isPressed('right')) {
      x++
    }

    return x
  }

  private static _signY() {
    let y = 0

    if (this.isPressed('up')) {
      y--
    }

    if (this.isPressed('down')) {
      y++
    }

    return y
  }

  private static _updateDirection() {
    let x = this._signX()
    let y = this._signY()

    this._dir8 = this._makeNumpadDirection(x, y)

    if (x !== 0 && y !== 0) {
      if (this._preferredAxis === 'x') {
        y = 0
      } else {
        x = 0
      }
    } else if (x !== 0) {
      this._preferredAxis = 'y'
    } else if (y !== 0) {
      this._preferredAxis = 'x'
    }

    this._dir4 = this._makeNumpadDirection(x, y)
  }

  private static _updateGamepadState(gamepad: Gamepad) {
    let lastState = this._gamepadStates[gamepad.index] || []
    let newState = [] as boolean[]

    let axes = gamepad.axes
    let buttons = gamepad.buttons
    let threshold = 0.5

    newState[12] = false
    newState[13] = false
    newState[14] = false
    newState[15] = false

    for (let i = 0; i < buttons.length; i++) {
      newState[i] = buttons[i].pressed
    }

    if (axes[1] < -threshold) {
      newState[12] = true
    } else if (axes[1] > threshold) {
      newState[13] = true
    }

    if (axes[0] < -threshold) {
      newState[14] = true
    } else if (axes[0] > threshold) {
      newState[15] = true
    }

    for (let j = 0; j < newState.length; j++) {
      if (newState[j] !== lastState[j]) {
        let buttonName = this.gamepadMapper[j]

        if (buttonName) {
          this._currentState[buttonName] = newState[j]
        }
      }
    }

    this._gamepadStates[gamepad.index] = newState
  }

  private static _wrapNwjsAlert() {
    if (Utils.isNwjs()) {
      let _alert = window.alert

      window.alert = function() {
        let gui = require('nw.gui') as typeof import('nw.gui')
        let win = gui.Window.get()

        _alert.apply(this, arguments as any)

        win.focus()
        Input.clear()
      }
    }
  }
}

//------------------------------------------------------------------------------

//------------------------------------------------------------------------------

/** The basic object that is rendered to the game screen */
// @ts-expect-error
class Sprite extends PIXI.Sprite {
  public _bitmap?: Bitmap
  public _blendColor: [number, number, number, number]
  public _canvas?: HTMLCanvasElement
  public _colorTone: [number, number, number, number]
  public _context?: CanvasRenderingContext2D
  public static _counter = 0
  public _frame: Rectangle
  public _realFrame: Rectangle
  public _refreshFrame?: boolean

  // @ts-ignore
  public _renderCanvas_PIXI = PIXI.Sprite.prototype._renderCanvas

  // @ts-ignore
  public _renderWebGL_PIXI = PIXI.Sprite.prototype._renderWebGL

  public _tintTexture?: PIXI.BaseTexture
  public opaque: boolean
  public spriteId: number
  public static voidFilter = new PIXI.filters.AlphaFilter()
  private _isPicture: boolean

  /** @param bitmap The image for the sprite */
  constructor(bitmap: Bitmap) {
    let texture = new PIXI.Texture(new PIXI.BaseTexture())

    super(texture)

    this._blendColor = [0, 0, 0, 0]
    this._colorTone = [0, 0, 0, 0]
    this._frame = new Rectangle()
    this._isPicture = false
    this._realFrame = new Rectangle()
    this.opaque = false
    this.spriteId = Sprite._counter++

    this.bitmap = bitmap
  }

  /** The image for the sprite */
  public get bitmap() {
    return this._bitmap
  }

  public set bitmap(value: Bitmap | undefined) {
    if (this._bitmap !== value) {
      this._bitmap = value

      if (value) {
        this._refreshFrame = true

        value.addLoadListener(this._onBitmapLoad.bind(this))
      } else {
        this._refreshFrame = false
        this.texture.frame = Rectangle.emptyRectangle
      }
    }
  }

  /**
   * Gets the blend color for the sprite
   *
   * @return The blend color for the sprite
   */
  public getBlendColor() {
    return this._blendColor.clone() as typeof this._blendColor
  }

  /**
   * Gets the color tone for the sprite
   *
   * @return The color tone for the sprite
   */
  public getColorTone() {
    return this._colorTone.clone() as typeof this._colorTone
  }

  /** The height of the sprite without the scale */
  // @ts-ignore
  public get height() {
    return this._frame.height
  }

  public set height(value: number) {
    this._frame.height = value

    this._refresh()
  }

  /**
   * Sets the X and Y at once
   *
   * @param x The X coordinate of the sprite
   * @param y The Y coordinate of the sprite
   */
  public move(x: number, y: number) {
    this.x = x
    this.y = y
  }

  /** The opacity of the sprite */
  public get opacity() {
    return this.alpha * 255
  }

  public set opacity(value: number) {
    this.alpha = value.clamp(0, 255) / 255
  }

  /**
   * Sets the blend color for the sprite
   *
   * @param color The blend color for the sprite
   */
  public setBlendColor(color: [number, number, number, number]) {
    if (!(color instanceof Array)) {
      throw new Error('Argument must be an array')
    }

    if (!this._blendColor.equals(color)) {
      this._blendColor = color.clone() as typeof color

      this._refresh()
    }
  }

  /**
   * Sets the color tone for the sprite
   *
   * @param tone The color tone for the sprite
   */
  public setColorTone(tone: [number, number, number, number]) {
    if (!(tone instanceof Array)) {
      throw new Error('Argument must be an array')
    }

    if (!this._colorTone.equals(tone)) {
      this._colorTone = tone.clone() as typeof tone

      this._refresh()
    }
  }

  /** Updates the sprite for each frame */
  public update() {
    this.children.forEach(child => {
      if ((child as any).update) {
        (child as any).update()
      }
    })
  }

  /** The width of the sprite without the scale */
  // @ts-ignore
  public get width() {
    return this._frame.width
  }

  public set width(value: number) {
    this._frame.width = value

    this._refresh()
  }

  private _createTinter(w: number, h: number) {
    if (!this._canvas) {
      this._canvas = document.createElement('canvas')
      this._context = this._canvas.getContext('2d')!
    }

    this._canvas.height = h
    this._canvas.width = w

    if (!this._tintTexture) {
      this._tintTexture = new PIXI.BaseTexture(this._canvas)
    }

    this._tintTexture.height = h
    this._tintTexture.scaleMode = this._bitmap!.baseTexture.scaleMode
    this._tintTexture.width = w
  }

  private _executeTint(x: number, y: number, w: number, h: number) {
    let color = this._blendColor
    let context = this._context!
    let tone = this._colorTone

    context.globalCompositeOperation = 'copy'

    context.drawImage(this._bitmap!.canvas, x, y, w, h, 0, 0, w, h)

    if (Graphics.canUseSaturationBlend()) {
      let gray = Math.max(0, tone[3])

      context.fillStyle = `rgba(255, 255, 255, ${gray / 255})`
      context.globalCompositeOperation = 'saturation'

      context.fillRect(0, 0, w, h)
    }

    let b1 = Math.max(0, tone[2])
    let g1 = Math.max(0, tone[1])
    let r1 = Math.max(0, tone[0])

    context.fillStyle = Utils.rgbToCssColor(r1, g1, b1)
    context.globalCompositeOperation = 'lighter'

    context.fillRect(0, 0, w, h)

    if (Graphics.canUseDifferenceBlend()) {
      context.fillStyle = 'white'
      context.globalCompositeOperation = 'difference'

      context.fillRect(0, 0, w, h)

      let b2 = Math.max(0, -tone[2])
      let g2 = Math.max(0, -tone[1])
      let r2 = Math.max(0, -tone[0])

      context.fillStyle = Utils.rgbToCssColor(r2, g2, b2)
      context.globalCompositeOperation = 'lighten'

      context.fillRect(0, 0, w, h)

      context.fillStyle = 'white'
      context.globalCompositeOperation = 'difference'

      context.fillRect(0, 0, w, h)
    }

    let a3 = Math.max(0, color[3])
    let b3 = Math.max(0, color[2])
    let g3 = Math.max(0, color[1])
    let r3 = Math.max(0, color[0])

    context.fillStyle = Utils.rgbToCssColor(r3, g3, b3)
    context.globalAlpha = a3 / 255
    context.globalCompositeOperation = 'source-atop'

    context.fillRect(0, 0, w, h)

    context.globalAlpha = 1
    context.globalCompositeOperation = 'destination-in'

    context.drawImage(this._bitmap!.canvas, x, y, w, h, 0, 0, w, h)
  }

  private _isInBitmapRect(x: number, y: number, w: number, h: number) {
    return (
      this._bitmap
        && x + w > 0
        && y + h > 0
        && x < this._bitmap.width
        && y < this._bitmap.height
    )
  }

  private _needsTint() {
    let tone = this._colorTone

    return tone[0] || tone[1] || tone[2] || tone[3] || this._blendColor[3] > 0
  }

  private _onBitmapLoad(bitmapLoaded: Bitmap) {
    if (this._bitmap === bitmapLoaded) {
      if (this._refreshFrame && this._bitmap) {
        this._refreshFrame = false

        this._frame.height = this._bitmap.height
        this._frame.width = this._bitmap.width
      }
    }

    this._refresh()
  }

  private _refresh() {
    let bitmapH = this._bitmap?.height ?? 0
    let bitmapW = this._bitmap?.width ?? 0
    let frameH = Math.floor(this._frame.height)
    let frameW = Math.floor(this._frame.width)
    let frameX = Math.floor(this._frame.x)
    let frameY = Math.floor(this._frame.y)
    let realX = frameX.clamp(0, bitmapW)
    let realY = frameY.clamp(0, bitmapH)

    let realH = (frameH - realY + frameY).clamp(0, bitmapH - realY)
    let realW = (frameW - realX + frameX).clamp(0, bitmapW - realX)

    this._realFrame.height = realH
    this._realFrame.width = realW
    this._realFrame.x = realX
    this._realFrame.y = realY

    this.pivot.x = frameX - realX
    this.pivot.y = frameY - realY

    if (realW > 0 && realH > 0) {
      if (this._needsTint()) {
        this._createTinter(realW, realH)
        this._executeTint(realX, realY, realW, realH)

        this._tintTexture!.update()

        this.texture.baseTexture = this._tintTexture!
        this.texture.frame = new Rectangle(0, 0, realW, realH)
      } else {
        if (this._bitmap) {
          this.texture.baseTexture = this._bitmap!.baseTexture
        }

        this.texture.frame = this._realFrame
      }
    } else if (this._bitmap) {
      this.texture.frame = Rectangle.emptyRectangle
    } else {
      this.texture.baseTexture.height = Math.max(
        this.texture.baseTexture.height,
        this._frame.y + this._frame.height
      )

      this.texture.baseTexture.width = Math.max(
        this.texture.baseTexture.width,
        this._frame.x + this._frame.width
      )

      this.texture.frame = this._frame
    }

    (this.texture as any)._updateID++
  }

  private _renderCanvas(renderer: PIXI.CanvasRenderer) {
    if (this.bitmap) {
      this.bitmap.touch()

      if (!this.bitmap.isReady()) {
        return
      }
    }

    if (this.texture.frame.width > 0 && this.texture.frame.height > 0) {
      this._renderCanvas_PIXI(renderer)
    }
  }

  private _renderWebGL(renderer: PIXI.WebGLRenderer) {
    if (this.bitmap) {
      this.bitmap.touch()

      if (!this.bitmap.isReady()) {
        return
      }
    }

    if (this.texture.frame.width > 0 && this.texture.frame.height > 0) {
      if (this._bitmap) {
        this._bitmap.checkDirty()
      }

      // Copy of PIXI.js internal code
      this.calculateVertices()

      if (this.pluginName === 'sprite' && this._isPicture) {
        // Use heavy renderer, which reduces artifacts and applies correct
        // `blendMode` but does not use multitexture optimization
        this._speedUpCustomBlendModes(renderer)

        renderer.setObjectRenderer(renderer.plugins.picture)
        renderer.plugins.picture.render(this)
      } else {
        // Use PIXI.js super-speed renderer
        renderer.setObjectRenderer(renderer.plugins[this.pluginName])
        renderer.plugins[this.pluginName].render(this)
      }
    }
  }

  private _speedUpCustomBlendModes(
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer
  ) {
    let blend = this.blendMode
    let picture = renderer.plugins.picture

    if (
      (renderer as any).renderingToScreen
        && (renderer as any)._activeRenderTarget.root
    ) {
      if (picture.drawModes[blend]) {
        let stage = (renderer as any)._lastObjectRendered

        let f = stage._filters

        if (!f || !f[0]) {
          setTimeout(() => {
            let f = stage._filters

            if (!f || !f[0]) {
              stage.filterArea = new PIXI.Rectangle(
                0,
                0,
                Graphics.width,
                Graphics.height
              )

              stage.filters = [Sprite.voidFilter]
            }
          }, 0)
        }
      }
    }
  }
}

//------------------------------------------------------------------------------

/** The root object of the display tree */
class Stage extends PIXI.Container {
  constructor() {
    super()

    // The `interactive` flag causes a memory leak
    this.interactive = false
  }
}

//------------------------------------------------------------------------------

/** The static class that handles JSON with object information */
abstract class JsonEx {
  /** The maximum depth of objects */
  public static maxDepth = 100
  private static _id = 1

  private static _cleanMetadata(object: object) {
    if (!object) { return }

    delete (object as any)['@']
    delete (object as any)['@c']

    if (typeof object === 'object') {
      Object.keys(object).forEach(key => {
        let value = (object as any)[key]

        if (typeof value === 'object') {
          JsonEx._cleanMetadata(value)
        }
      })
    }
  }

  private static _generateId() {
    return JsonEx._id++
  }

  private static _getConstructorName(value: object) {
    let name = value.constructor.name

    if (name === undefined) {
      let func = /^\s*function\s*([A-Za-z0-9_$]*)/
      name = func.exec((value.constructor as any))![1]
    }

    return name
  }

  private static _resetPrototype(value: object, prototype: object) {
    if (Object.setPrototypeOf !== undefined) {
      Object.setPrototypeOf(value, prototype)
    } else if ('__proto__' in value) {
      value.__proto__ = prototype
    } else {
      let newValue = Object.create(prototype)

      for (let key in value) {
        if (value.hasOwnProperty(key)) {
          newValue[key] = (value as any)[key]
        }
      }

      value = newValue
    }

    return value
  }
}

//------------------------------------------------------------------------------

abstract class Decrypter {
  public static hasEncryptedAudio = false
  public static hasEncryptedImages = false
  public static REMAIN = ''
  public static SIGNATURE = ''
  public static VER = ''

  private static _encryptionKey = ''
  private static _headerLength = 16
  private static _ignoreList = ['img/system/Window.png']
  private static _xhrOk = 400

  public static checkImgIgnore(url: string) {
    for (let cnt = 0; cnt < this._ignoreList.length; cnt++) {
      if (url === this._ignoreList[cnt]) {
        return true
      }
    }

    return false
  }

  public static createBlobUrl(arrayBuffer: ArrayBuffer) {
    let blob = new Blob([arrayBuffer])

    return URL.createObjectURL(blob)
  }

  public static cutArrayHeader(arrayBuffer: ArrayBuffer, length: number) {
    return arrayBuffer.slice(length)
  }

  public static decryptArrayBuffer(arrayBuffer: ArrayBuffer) {
    if (!arrayBuffer) { return null }

    let header = new Uint8Array(arrayBuffer, 0, this._headerLength)
    let i: number
    let ref = this.SIGNATURE + this.VER + this.REMAIN
    let refBytes = new Uint8Array(16)

    for (i = 0; i < this._headerLength; i++) {
      refBytes[i] = parseInt(`0x${ref.substr(i * 2, 2)}`, 16)
    }

    for (i = 0; i < this._headerLength; i++) {
      if (header[i] !== refBytes[i]) {
        throw new Error('header is wrong')
      }
    }

    arrayBuffer = this.cutArrayHeader(arrayBuffer, Decrypter._headerLength)

    let view = new DataView(arrayBuffer)

    this.readEncryptionKey()

    if (arrayBuffer) {
      let byteArray = new Uint8Array(arrayBuffer)

      for (i = 0; i < this._headerLength; i++) {
        byteArray[i] = byteArray[i] ^ parseInt(Decrypter._encryptionKey[i], 16)

        view.setUint8(i, byteArray[i])
      }
    }

    return arrayBuffer
  }

  public static decryptImg(url: string, bitmap: Bitmap) {
    url = this.extToEncryptExt(url)

    let requestFile = new XMLHttpRequest()

    requestFile.open('GET', url)

    requestFile.responseType = 'arraybuffer'

    requestFile.send()

    requestFile.onerror = function() {
      if (bitmap._loader) {
        bitmap._loader()
      } else {
        (bitmap as any)._onError()
      }
    }

    requestFile.onload = function() {
      if (this.status < Decrypter._xhrOk) {
        let arrayBuffer = Decrypter.decryptArrayBuffer(requestFile.response)!

        bitmap._image!.src = Decrypter.createBlobUrl(arrayBuffer)

        bitmap._image!.addEventListener(
          'error',
          bitmap._errorListener = bitmap._loader
            || (Bitmap.prototype as any)._onError.bind(bitmap)
        )

        bitmap._image!.addEventListener(
          'load',
          bitmap._loadListener = (Bitmap.prototype as any)._onLoad.bind(bitmap)
        )
      }
    }
  }

  public static extToEncryptExt(url: string) {
    let ext = url.split('.').pop()!
    let outExt = ext

    if (ext === 'ogg') {
      outExt = '.rpgmvo'
    } else if (ext === 'm4a') {
      outExt = '.rpgmvm'
    } else if (ext === 'png') {
      outExt = '.rpgmvp'
    } else {
      outExt = ext
    }

    return url.slice(0, url.lastIndexOf(ext) - 1) + outExt
  }

  public static readEncryptionKey() {
    return '6bdb2e585882fbd48826ef9cffd4c511'
  }
}

//------------------------------------------------------------------------------

/** The static class that handles resource loading */
abstract class ResourceHandler {
  public static _defaultRetryInterval = [500, 1000, 3000]
  public static _reloaders = [] as (() => void)[]

  public static createLoader(
    url?: string,
    retryMethod?: () => void,
    resignMethod?: () => void,
    retryInterval?: number[]
  ) {
    retryInterval ||= this._defaultRetryInterval

    let reloaders = this._reloaders
    let retryCount = 0

    return () => {
      if (retryCount < retryInterval!.length) {
        setTimeout(retryMethod!, retryInterval![retryCount])
      } else {
        if (resignMethod) {
          resignMethod()
        }

        if (url) {
          if (reloaders.length === 0) {
            Graphics.printLoadingError(url)
            // SceneManager.stop()
          }

          reloaders.push(() => {
            retryCount = 0

            retryMethod!()
          })
        }
      }
    }
  }

  public static exists() {
    return this._reloaders.length > 0
  }

  public static retry() {
    if (this._reloaders.length > 0) {
      Graphics.eraseLoadingError()
      // SceneManager.resume()

      this._reloaders.forEach(reloader => {
        reloader()
      })

      this._reloaders.length = 0
    }
  }
}
