/*
    ┌────┐
    │    │
┌───┘    └───┐
│            │
│            │
│            │
└─・・・・・・─┘
SW0 ⋯　⋯ ⋯ SW5

*/

//digital pins
#define PIN_A2  (20)
#define PIN_A1  (19)
#define PIN_A0  (18)
#define PIN_D9   (9)
#define PIN_D10 (10)
#define PIN_D11 (11)

enum Switches {
  SW0 = PIN_D11,
  SW1 = PIN_D10,
  SW2 = PIN_D9,
  SW3 = PIN_A0,
  SW4 = PIN_A1,
  SW5 = PIN_A2,
};

void setupPinModeSwitches() {
  pinMode(SW0, INPUT_PULLUP);
  pinMode(SW1, INPUT_PULLUP);
  pinMode(SW2, INPUT_PULLUP);
  pinMode(SW3, INPUT_PULLUP);
  pinMode(SW4, INPUT_PULLUP);
  pinMode(SW5, INPUT_PULLUP);
}

bool isSwicthOn(int sw) {
  return digitalRead(sw) == LOW;
}
void waitForBtnRelease(int sw) {
  while(isSwicthOn(sw)) delay(10);  
}

void bootKeyboardPrint(const char string[], int wait = 10) {
  BootKeyboard.print(string);    
  delay(wait);
}
void bootKeyboardWrite(const KeyboardKeycode key, int repeat = 1) {
  for (int n = 0; n < repeat; n++) BootKeyboard.write(key);    
  delay(10);
}
void bootKeyboardSynchronousWrite(const KeyboardKeycode keys[], int wait = 100) {
  #pragma message "keys is 0 terminated."
  for (int n = 0; keys[n] != KEY_RESERVED; n++) {
    BootKeyboard.press(keys[n]);
    delay(10);
  }
  BootKeyboard.releaseAll();
  delay(wait);
}

void ledSign(int count = 1, int interval = 100) {
  for (int n = 0; n < count; n++) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(interval);
    digitalWrite(LED_BUILTIN, LOW);
    delay(interval);
  }
}
