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

const char id[] = "ididididid\t";
const char passwd[] = "passwdpasswd\n";
const char mail[] = "firstname.lastname.jw[domain.com\n";
bool done = false;
unsigned long sw0duration = 0;
bool sw0on = false, sw1on, sw2on, sw3on, sw4on, sw5on;

void loop() {

//ID/Pass key sender
  done = false;

  if (isSwicthOn(SW0) && !sw0on) {
    digitalWrite(LED_BUILTIN, HIGH);
    waitForBtnRelease(SW0);
    sw0on = true;
    sw0duration = millis();
  } else if (sw0on) {
    if (sw0duration + 1000 < millis()) {
      sw0on = false;
      sw0duration = 0;
      digitalWrite(LED_BUILTIN, LOW);
    }
  }

  sw1on = sw0on && isSwicthOn(SW1);
  sw2on = sw0on && isSwicthOn(SW2);
  sw3on = sw0on && isSwicthOn(SW3);
  sw4on = sw0on && isSwicthOn(SW4);
  sw5on = sw0on && isSwicthOn(SW5);
  
  if (onlyOneOn(SW1)) {
    // MS-DOS prompt
    KeyboardKeycode win_R[] = {KEY_LEFT_GUI, KEY_R, 0};
    bootKeyboardSynchronousWrite(win_R);
    bootKeyboardPrint("cmd", 100);
    bootKeyboardWrite(KEY_ENTER, 1);
    done = true;
  }
  if (onlyOneOn(SW2)) {
    bootKeyboardPrint(id, 10);    
    done = true;
  }
  if (onlyOneOn(SW2) || onlyOneOn(SW1)) {
    bootKeyboardPrint(passwd, 100);    
    done = true;
  }
  if (onlyOneOn(SW3)) {
    // no aasgin
  }
  if (onlyOneOn(SW4)) {
    bootKeyboardPrint(mail, 100);
    done = true;
  }
  if (onlyOneOn(SW5)) {
    // 9:00-17:30 T/L Work
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
  
  if (done) {
    waitForBtnRelease(SW1);
    waitForBtnRelease(SW2);
    waitForBtnRelease(SW3);
    waitForBtnRelease(SW4);
    waitForBtnRelease(SW5);
    digitalWrite(LED_BUILTIN, LOW);
    sw0on = false;
    sw0duration = 0; 
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
  int bit = (sw1on << 1) | (sw2on << 2) | (sw3on << 3) | (sw4on << 4) | (sw5on << 5);
  int mask = 0;
  switch (sw) {
  case SW1: mask = 1 << 1; break;
  case SW2: mask = 1 << 2; break;
  case SW3: mask = 1 << 3; break;
  case SW4: mask = 1 << 4; break;
  case SW5: mask = 1 << 5; break;
  default: break;
  }
  return bit == mask; 
}
