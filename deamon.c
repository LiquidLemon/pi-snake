#include <stdio.h>
#include "../ld-1088bs/lib.c"

PI_THREAD (refresh_loop) {
  while(1) { refresh(); }
}

int main() {
  init();
  clear();
  int x, y;
  char command;
  if (piThreadCreate(refresh_loop) != 0) {
    puts("Thread didn't start");
    return -1;
  }
  int i, j;
  while(1) {
    scanf("%c", &command);
    switch (command) {
      case 'i':
        scanf("%d1", &x);
        scanf("%d1", &y);
        printf("Pixel invert issued on (%d, %d)\n", x, y);
        invertLED(x,y);
        break;
      case 's':
        scanf("%d1", &x);
        scanf("%d1", &y);
        printf("Pixel set issued on (%d, %d)\n", x, y);
        setLED(x, y);        
        break; 
      case 'r':
        for (i = 0; i < 8; ++i) {
          for (j = 0; j < 8; ++j) {
            clearLED(i, j);
          }
        }
        break;
      case '\n':
        continue;
        break;
      default:
        puts("Unknown command");
        break;
    }
  }
  return 0;
}
