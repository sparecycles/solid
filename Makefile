SRC=src/game.ts src/collide.ts src/sound.ts
all: $(SRC:.ts=.js)

%.js: %.ts
	tsc $^

clean:
	-rm $(SRC:.ts=.js)

.PHONY: clean
