'use strict';

class DPEH600 {

  constructor() {
    this.keys = ['vcc', 'gnd', 'tx', 'rx', 'gnd2', 'baud', 'cts'];
    this.requiredKeys = ['tx', 'rx', 'baud'];

    this.displayIoNames = {
      vcc: 'vcc',
      gnd: 'gnd',
      tx: 'tx',
      rx: 'rx',
      gnd2: 'gnd',
      cts: 'cts',
    }

    this.char = {
      TAB: 9,
      LF : 10,
      FF : 12,
      CR : 13,
      SO : 14,
      DC2: 18,
      DC4: 20,
      ESC: 27,
      FS : 28,
      GS : 29,
    }

    this.barcodeType = {
//                //  BARCODE   length
      upc_a : 65, //   UPC-A     11-12
      upc_e : 66, //   UPC-E     11-12
      ean13 : 67, //   EAN13     12-13
      jan13 : 67, //   JAN13     12-13
      ean8  : 68, //   EAN8       7-8
      jan8  : 68, //   JAN8       7-8
      code39: 69, //   CODE39     1-255
      itf   : 70, //   ITF        1-255 (EVEN NUMBER)
      codebar:71, //   CODEBAR    1-255
      code93: 72, //   CODE93     1-255
      code128:73, //   CODE128    2-255
    }

  }

  static info() {
    return {
      name: 'DPEH600',
      description: 'DP-EH600/サーマルプリンタ/UARTシリアル制御/DC5-9V,1.5A/58mm幅ロール紙',
      shop: 'https://www.amazon.co.jp/%E3%82%B5%E3%83%BC%E3%83%9E%E3%83%AB%E3%83%97%E3%83%AA%E3%83%B3%E3%82%BF%E3%83%A6%E3%83%8B%E3%83%83%E3%83%88-%E6%84%9F%E7%86%B1%E7%B4%99%E3%83%97%E3%83%AA%E3%83%B3%E3%82%BF-TTL%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%AB%E5%88%B6%E5%BE%A1-DC5-9V-58mm%E5%B9%85%E3%83%AD%E3%83%BC%E3%83%AB%E7%B4%99%2Fdp%2FB07DTGXCHD%2F',
    };
  }

  wired(obniz) {
    this.obniz = obniz;

    if (this.obniz.isValidIO(this.params.vcc)) {
      this.obniz.getIO(this.params.vcc).drive('5v');
      this.obniz.getIO(this.params.vcc).output(true);
    }
    if (this.obniz.isValidIO(this.params.gnd)) {
      this.obniz.getIO(this.params.gnd).output(false);
    }
    if (this.obniz.isValidIO(this.params.gnd2)) {
      this.obniz.getIO(this.params.gnd2).output(false);
    }

    this.uart = obniz.getFreeUart();
    if (this.obniz.isValidIO(this.params.cts)) {
      this.ctsEnabled = true;
      this.io_cts = this.obniz.getIO(this.params.cts);
      this.uart.start({tx:this.params.tx, rx:this.params.rx, baud:this.params.baud, flowcontrol:'cts', cts:this.params.cts});
    } else {
      this.ctsEnabled = false;
      this.uart.start({tx:this.params.tx, rx:this.params.rx, baud:this.params.baud});
    }

    this.width = 384;
    this.printMode = {};
  }

  init(param) { // {heatingDots:5, heatTime:100, heatInterval:40}
    param = param || {};
    param.heatedPoint = param.heatedPoint || 5;
    param.heatTime = param.heatTime || 100;
    param.heatInterval = param.heatInterval || 40;
    this.wakeup();
    this.reset();
    this.uart.send([this.char.ESC, 55, param.heatedPoint, param.heatTime, param.heatInterval]);　// [ESC 7] configure heating params
    this.setTabs([4, 8, 12, 16, 20, 24, 28, 32, 36, 40]);
  }
  reset() {
    this.uart.send([this.char.ESC, 64]); // ESC @  Initialize. Clear buffer
    this.printMode = {};
  }
  setTabs(tabs) {
    const data = [].concat([this.char.ESC, 68], tabs, [0]);
    this.uart.send(data); // [ESC D]
  }
  offline() {
    this.uart.send([this.char.ESC, 61, 0]);
  }
  online() {
    this.uart.send([this.char.ESC, 61, 1]);
  }
  sleep() {
    this._sleep_after(1);  // Can't be 0, that means 'don't sleep'
  }
  _sleep_after(seconds) {
    if (seconds != null) {
      this.uart.send([this.char.ESC, 56, seconds & 0xff, (seconds >> 8) & 0xff]);
    }
  }
  wakeup() {
    this.uart.send([0xff]); // return from sleep
    this.obniz.wait(100);
    this.uart.send([this.char.ESC, 56, 0, 0]); // [ESC 8]never sleep
  }
  testPrint() {
    this.uart.send([this.char.DC2, 84]); // [DC2 T]
  }
  tab(number) {
    number = number || 1;
    for (let n = 0; n < number; n++) {
      this.uart.send([this.char.TAB]);
    }
  }
  linefeed(number) {
    number = number || 1;
    for (let n = 0; n < number; n++) {
      this.uart.send([this.char.LF]);
    }
  }
  async hasPaper() {
    const status = await getStatus();
    return (!status.paper);
  }
  async getStatus() {
    this.uart.send([this.char.ESC, 118, 0]); //[ESC v ]
    while(1) {
      await this.obniz.wait(10);
      if (this.uart.isDataExists()) {
        let status = this.uart.readBytes();
        let result = {};
        result.movement = (status[0] & 0x01) != 0;
        result.paper = (status[0] & 0x04) != 0;
        result.voltage = (status[0] & 0x08) != 0;
        result.temperature = (status[0] & 0x40) != 0;
        return result;
      }
    }
  }
  _align(alignment) {
    alignment = alignment || 'L';
    let pos = 0;
    switch (alignment.toUpperCase().substr(0, 1)) {
      case 'L': pos = 0; break;
      case 'C': pos = 1; break;
      case 'R': pos = 2; break;
      default:;
    }
    this.uart.send([this.char.ESC, 97, pos]); //ESC a
  }
  _reverseString(str) {
    return str.split("").reverse().join("");
  }
  setPrintMode(mode) {
// {fontB:false, invert:false, bold:false, higher:false, wider:false, deleteline:false, underline:false, upsidedown:false, rotation:false}
    mode = mode || {};
    mode.fontB = mode.fontB || false;
    mode.visual = mode.visual || false;
    mode.invert = mode.invert || false;
    mode.bold = mode.bold || false;
    mode.higher = mode.higher || false;
    mode.wider = mode.wider || false;
    mode.deleteline = mode.deleteline || false;
    mode.underline = mode.underline || false;
    mode.upsidedown = mode.upsidedown || false;
    mode.rotation = mode.rotation || false;

    let param = 0;
    if (mode.fontB) param |= 0x01;
    if (mode.visual) param |= 0x02;
    if (mode.invert) param |= 0x04;
    if (mode.bold) param |= 0x08;
    if (mode.higher) param |= 0x10;
    if (mode.wider) param |= 0x20;
    if (mode.deleteline) param |= 0x40;
    this.uart.send([this.char.ESC, 33, param]); //ESC !

    this.uart.send([this.char.ESC, 45, (mode.underline) ? 1 : 0]); //ESC -
    this.uart.send([this.char.GS, 66, (mode.invert) ? 1 : 0]); //GS B
    this.uart.send([this.char.ESC, 123, (mode.upsidedown) ? 1 : 0]); //ESC {
    this._align(mode.align);
    this.uart.send([this.char.ESC, 86, (mode.rotation) ? 1 : 0]); //ESC V

    this.printMode = mode;
  }

  barcodeWidthHeight(param) {
    param = param || {};
    let width = param.width || 3; // 2-6 Default 3
    let height = param.height || 162; // 1-255 Default 162
    if (2 > width || width > 6) width = 3;
    if (1 > height || height > 255) height = 162;
    this.uart.send([this.char.GS, 119, width]); //GS w
    this.uart.send([this.char.GS, 104, height]); //GS h
  }
  printBarcode(type, code, pos) {
    pos = pos || 2; //1:Abovebarcode 2:Below 3:Both 0:Not printed
    this.uart.send([this.char.GS, 72, pos]); //GS H
    this.uart.send([this.char.GS, 107, type, code.length]); //GS k
    this.uart.send(code);
  }

  printText(msg) {
    if (typeof msg === 'string') {
      this.uart.send(msg + '\r\n');
    } else {
      for (let n = 0; n < msg.length; n++) {
        const line = msg[n];
        this.uart.send(line + '\r\n');
      }
    }
  }

  printBitmap(bitmap, width, height, reverse) {
    if (width > this.width) {
      throw new Error(`Bitmap width too large: ${width}. Needs to be under ${this.width}`);
    } else if (width < this.width) {
      console.log(`Bitmap width under 384 (${width}), padding the rest with white`);
    }

    let counter = 0;
    const chunkWidth = Math.ceil(width / 8);

    for (let r = 0; r < height; r += 255) {
      let print_bytes = [];
      const chunkHeight = (height - r) > 255 ? 255 : height - r;

      // DC2 * r n [d1…dn]
      print_bytes.push(this.char.DC2);
      print_bytes.push(42);
      print_bytes.push(chunkHeight);
      print_bytes.push(chunkWidth);

      for (let i = 0; i < chunkWidth * chunkHeight; i += chunkWidth) {
        let remain = width;
        for (let c = 0; c < chunkWidth; c++) {
          let byt = 0;
          for (let b = 0; b < 8; b++) {
            if (remain > 0) {
              const pixel_value = bitmap[counter++];
              if ((reverse) ? pixel_value == 0 : pixel_value != 0) {
                byt += 1 << (7 - b);
              }
              --remain;
            }
          }
          print_bytes.push(byt);
        }
      }
      this.uart.send(print_bytes);
    }
  }
  drawContext(context, x, y, width, height) {
    x = x || 0;
    y = y || 0;
    width = width || context.canvas.clientWidth;
    height = height || context.canvas.clientHeight;
    const imageData = context.getImageData(x, y, width, height).data;
    const bitmap = new Array(width * height).fill(0);
    let m = 0;
    for (let n = 0; n < imageData.length; n += 4) {
      const r = imageData[n + 0];
      const g = imageData[n + 1];
      const b = imageData[n + 2];
      const grayScale = 0.299 * r + 0.587 * g + 0.114 * b;
      bitmap[m++] = (grayScale > 127.5) ? 0 : 1;
    }
    this.printBitmap(bitmap, width, height);
  }

}

if (typeof module === 'object') {
  module.exports = DPEH600;
}