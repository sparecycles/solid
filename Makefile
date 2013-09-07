all: src/game.js src/collide.js

%.js: %.ts
	tsc $^
