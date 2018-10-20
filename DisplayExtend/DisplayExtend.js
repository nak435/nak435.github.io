// Usage: https://nak435.github.io/DisplayExtend/DisplayExtend.md
class DisplayExtend {
  constructor(obniz) {
    this.obniz = obniz;
    this.width = 128;
    this.height = 64;

    this._canvas = null;
    this._reset();
  }

  _reset() {
    this._pos = { x: 0, y: 0 };
    this._autoClear = 0; //no-auto
    this._drawImmediately = true;
  }

  warnCanvasAvailability() {
    if (this.obniz.isNode) {
      throw new Error(
        'DisplayExtend.js require node-canvas to draw rich contents. see more detail on docs'
      );
    } else {
      throw new Error('DisplayExtend.js cant create canvas element to body');
    }
  }

  _preparedCanvas() {
    if (this._canvas) {
      return this._canvas;
    }
    if (this.obniz.isNode) {
      try {
        const { createCanvas } = require('canvas');
        if (typeof createCanvas !== 'undefined') {
          this._canvas = createCanvas(this.width, this.height);
        }
        else {
          const Canvas = require('canvas');
          this._canvas = new Canvas(this.width, this.height);
        }        
      } catch (e) {
        // this.warnCanvasAvailability();
        return null;
      }
    } else {
      const identifier = 'obnizcanvas-' + this.obniz.id;
      let canvas = document.getElementById(identifier);
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.setAttribute('id', identifier);
        canvas.style.visibility = 'hidden';
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style['-webkit-font-smoothing'] = 'none';
        let body = document.getElementsByTagName('body')[0];
        body.appendChild(canvas);
      }
      this._canvas = canvas;
    }
    const context = this._canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, this.width, this.height);
    context.fillStyle = '#FFF';
    context.strokeStyle = '#FFF';
    this._pos.x = 0;
    this._pos.y = 0;
    this.fontSize = 16;
    context.font = `${this.fontSize}px Arial`;
    return this._canvas;
  }

  _context() {
    const canvas = this._preparedCanvas();
    if (canvas) {
      return canvas.getContext('2d');
    }
  }

  font(font, size) {
    const context = this._context();
    if (typeof size !== 'number') {
      size = 16;
    }
    if (typeof font !== 'string') {
      font = 'Arial';
    }
    this.fontSize = size;
    context.font = `${this.fontSize}px ${font}`;
  }

  clearCanvas() {
    const context = this._context();
    if (context) {
      context.fillStyle = '#000';
      context.fillRect(0, 0, this.width, this.height);
      context.fillStyle = '#FFF';
      context.strokeStyle = '#FFF';
    }
    this._pos.x = 0;
    this._pos.y = 0;
  }
  clear() {
    this.clearCanvas();
    let obj = {};
    obj['display'] = {
      clear: true,
    };
    this.obniz.send(obj);
  }

  pos(x, y) {
    this._context();
    if (typeof x == 'number') {
      this._pos.x = x;
    }
    if (typeof y == 'number') {
      this._pos.y = y;
    }
    return this._pos;
  }

  print(text) {
    const context = this._context();
    if (context) {
      context.fillText(text, this._pos.x, this._pos.y + this.fontSize);
      if (this._drawImmediately) this.draw(context);
      this._pos.y += this.fontSize;
    } else {
      let obj = {};
      obj['display'] = {
        text: '' + text,
      }
      this.obniz.send(obj);
    }
  }

  line(x_0, y_0, x_1, y_1) {
    const context = this._context();
    if (context) {
      context.beginPath();
      context.lineWidth = this.lineSize;
      context.lineCap = 'round';
      context.moveTo(x_0, y_0);
      context.lineTo(x_1, y_1);
      context.stroke();
      if (this._drawImmediately) this.draw(context);
    } else {
      this.warnCanvasAvailability();
    }
  }

  rect(x, y, width, height, mustFill) {
    const context = this._context();
    if (context) {
      if (mustFill) {
        context.fillRect(x, y, width, height);
      } else {
        context.strokeRect(x, y, width, height);
      }
      if (this._drawImmediately) this.draw(context);
    } else {
      this.warnCanvasAvailability();
    }
  }

  circle(x, y, radius, mustFill) {
    this.arc(x, y, radius, 0, Math.PI * 2, false, mustFill);
  }

  qr(text, correction) {
    let obj = {};
    obj['display'] = {
      qr: {
        text,
      },
    };
    if (correction) {
      obj['display'].qr.correction = correction;
    }
    this.obniz.send(obj);
  }

  raw(data) {
    let obj = {};
    obj['display'] = {
      raw: data,
    };
    this.obniz.send(obj);
    this._setTimeout();
  }

  setPinName(io, moduleName, funcName) {
    let obj = {};
    obj['display'] = {};
    obj['display']['pin_assign'] = {};
    obj['display']['pin_assign'][io] = {
      module_name: moduleName,
      pin_name: funcName,
    };

    this.obniz.send(obj);
  }

  setPinNames(moduleName, data) {
    let obj = {};
    obj['display'] = {};
    obj['display']['pin_assign'] = {};
    let noAssignee = true;
    for (let key in data) {
      noAssignee = false;
      obj['display']['pin_assign'][key] = {
        module_name: moduleName,
        pin_name: data[key],
      };
    }
    if (!noAssignee) {
      this.obniz.send(obj);
    }
  }

  draw(context) {
    const stride = this.width / 8;
    let vram = new Array(stride * 64);
    const imageData = context.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
      let index = parseInt(i / 4);
      let line = parseInt(index / this.width);
      let col = parseInt((index - line * this.width) / 8);
      let bits = parseInt(index - line * this.width) % 8;
      if (bits == 0) vram[line * stride + col] = 0x00;
      if (brightness > 0x7f) vram[line * stride + col] |= 0x80 >> bits;
    }
    this.raw(vram);
    this._setTimeout();
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise, mustFill) {
    const context = this._context();
    if (context) {
      context.beginPath();
      context.lineWidth = this.lineSize;
      context.lineCap = 'round';
      context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      if (mustFill) {
        context.fill();
      } else {
        context.stroke();
      }
      if (this._drawImmediately) this.draw(context);
    } else {
      this.warnCanvasAvailability();
    }
  }

  roundRect(x, y, width, height, radius, mustFill) {
    const context = this._context();
    if (context) {
      context.beginPath();
        context.lineWidth = this.lineSize;
        context.lineCap = 'round';
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, 0, false);
        context.lineTo(x + width, y + height - radius);
        context.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5, false);
        context.lineTo(x + radius, y + height);
        context.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI, false);
        context.lineTo(x, y + radius);
        context.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false);
      context.closePath();
      if (mustFill) {
        context.fill();
      } else {
        context.stroke();
      }
      if (this._drawImmediately) this.draw(context);
    } else {
      this.warnCanvasAvailability();
    }
  }

  _setTimeout() {
    this._lastTime = new Date();
    if (this.autoClear > 0) {
      setTimeout(this._clear, this.autoClear + 10, this);
    }
  }

  _clear(that) {
  if (that.autoClear > 0) 
    if ((new Date() - that._lastTime) > that.autoClear) {
      that.clear();
      if (typeof that.onclear == 'function') that.onclear(true);
    }
  }

  get lineSize() {
    return this._lineSize || 1;
  }
  set lineSize(value) {
    this._lineSize = value;
  }
  get autoClear() {
    return this._autoClear;
  }
  set autoClear(value) {
    this._autoClear = value || 0; //ms
    this._lastTime = new Date();
  }
  get drawImmediately() {
    return this._drawImmediately || true;
  }
  set drawImmediately(value) {
    this._drawImmediately = value;
  }
}

if (typeof module === 'object') {
  module.exports = DisplayExtend;
}
