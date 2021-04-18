#include <HID-Project.h>
#include "nak_common.h"

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  setupPinModeSwitches();
  Mouse.begin();
  BootKeyboard.begin();
}

int delta = 1; // 1 or -1
unsigned long duration = 0;
const unsigned long mouseMoveInterval = 15 * 1000; //15sec

const char id[] = "idididid\t";
const char passwd[] = "passwd\n";
const char mail[] = "lastname.firstname.jw[domain.com\n";
bool done = false;
bool sw0on, sw1on, sw2on, sw3on, sw4on, sw5on;

void loop() {

//ID/Pass key sender
  done = false;

  sw0on = isSwicthOn(SW0);
  sw1on = isSwicthOn(SW1);
  sw2on = isSwicthOn(SW2);
  sw3on = isSwicthOn(SW3);
  sw4on = isSwicthOn(SW4);
  sw5on = isSwicthOn(SW5);
  
  if (onlyOneOn(SW0)) {
    // no assgin
    done = true;
  }
  if (onlyOneOn(SW5)) {
    bootKeyboardPrint(id, 10);    
    done = true;
  }
  if (onlyOneOn(SW5) || onlyOneOn(SW3)) {
    bootKeyboardPrint(passwd, 100);    
    done = true;
  }
  if (onlyOneOn(SW4)) {
    bootKeyboardPrint(mail, 100);
    done = true;
  }
  if (onlyOneOn(SW2)) {
    bootKeyboardPrint("0900");
    bootKeyboardWrite(KEY_TAB, 2);
    bootKeyboardPrint("1730");
    bootKeyboardWrite(KEY_TAB, 6);
    bootKeyboardWrite(KEY_DOWN_ARROW, 1);
    bootKeyboardWrite(KEY_TAB, 1);
    bootKeyboardWrite(KEY_DOWN_ARROW, 34);
    bootKeyboardWrite(KEY_TAB, 4);
    bootKeyboardPrint("0900");
    bootKeyboardWrite(KEY_TAB, 2);
    bootKeyboardPrint("1730");    
    done = true;
  }
  if (onlyOneOn(SW1)) {
    KeyboardKeycode win_R[] = {KEY_LEFT_GUI, KEY_R, 0};
    bootKeyboardSynchronousWrite(win_R);
    bootKeyboardPrint("cmd", 100);
    bootKeyboardWrite(KEY_ENTER, 1);
    done = true;
  }
  
  if (done) {
    waitForBtnRelease(SW0);
    waitForBtnRelease(SW1);
    waitForBtnRelease(SW2);
    waitForBtnRelease(SW3);
    waitForBtnRelease(SW4);
    waitForBtnRelease(SW5);
    ledSign(2, 100);
  }

  if (sw0on) return;

// sleep blocker
  auto now = millis();
  if (now < duration + mouseMoveInterval) return;

  Mouse.move(delta, 0);
  delta *= -1;
  ledSign();

  duration = now;
  delay(10);
}

bool onlyOneOn(int sw) {
  int bit = (sw0on << 1) | (sw1on << 2) | (sw2on << 3) | (sw3on << 4) | (sw4on << 5) | (sw5on << 6);
  int mask = 0;
  switch (sw) {
  case SW0: mask = 1 << 1; break;
  case SW1: mask = 1 << 2; break;
  case SW2: mask = 1 << 3; break;
  case SW3: mask = 1 << 4; break;
  case SW4: mask = 1 << 5; break;
  case SW5: mask = 1 << 6; break;
  default: break;
  }
  return bit == mask; 
}
