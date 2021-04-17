#include <HID-Project.h>

#define PIN_A2 (20)
#define PIN_A1 (19)
#define PIN_A0 (18)
#define PIN_D9  (9)
#define PIN_D10 (10)
#define PIN_D11 (11)

#define SW0 (PIN_D11)
#define SW1 (PIN_D10)
#define SW2 (PIN_D9)
#define SW3 (PIN_A0)
#define SW4 (PIN_A1)
#define SW5 (PIN_A2)

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(SW0, INPUT_PULLUP);
  pinMode(SW1, INPUT_PULLUP);
  pinMode(SW2, INPUT_PULLUP);
  pinMode(SW3, INPUT_PULLUP);
  pinMode(SW4, INPUT_PULLUP);
  pinMode(SW5, INPUT_PULLUP);
  Mouse.begin();
  BootKeyboard.begin();
}

int delta = 1; // 1 or -1
unsigned long duration = 0;
const unsigned long mouseMoveInterval = 15 * 1000; //15sec

void loop() {
  bool done = false;

//ID/Pass key sender
  if (isOn(SW0)) {
    digitalWrite(LED_BUILTIN, HIGH);
    print("sw0\n");
    done = true;
  } 
  if (isOn(SW1)) {
    digitalWrite(LED_BUILTIN, HIGH);
    print("sw1\n");    
    done = true;
  }
  if (isOn(SW2)) {
    digitalWrite(LED_BUILTIN, HIGH);
    print("sw2\n");    
    done = true;
  }
  if (isOn(SW3)) {
    digitalWrite(LED_BUILTIN, HIGH);
    print("sw3\n");    
    done = true;
  }
  if (isOn(SW4)) {
    digitalWrite(LED_BUILTIN, HIGH);
    print("sw4\n");    
    done = true;
  }
  if (isOn(SW5)) {
    digitalWrite(LED_BUILTIN, HIGH);
    print("sw5\n");    
    done = true;
  }

  if (done) {
    while(isOn(SW0)) delay(10);
    while(isOn(SW1)) delay(10);
    while(isOn(SW2)) delay(10);
    while(isOn(SW3)) delay(10);
    while(isOn(SW4)) delay(10);
    while(isOn(SW5)) delay(10);
    digitalWrite(LED_BUILTIN, LOW);
  }

// sleep blocker
  auto now = millis();
  if (now < duration + mouseMoveInterval) return;

  Mouse.move(delta, 0);
  delta *= -1;
  ledSign(1);

  duration = now;
  delay(10);
}

void print(const char string[]) {
    BootKeyboard.print(string);    
    delay(10);
}

void ledSign(int cnt) {
  for (int n = 0; n < cnt; n++) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(100);
    digitalWrite(LED_BUILTIN, LOW);
    delay(50);
  }
}

bool isOn(int pin) {
  return digitalRead(pin) == LOW;
}
