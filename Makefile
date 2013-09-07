all: src/game.js src/collide.js src/sound.js

%.js: %.ts
	tsc $^
