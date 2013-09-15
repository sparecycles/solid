SRC=src/game.ts src/collide.ts src/sound.ts
all: $(SRC:.ts=.js)

%.js: %.ts
	tsc $^

clean:
	-rm $(SRC:.ts=.js)

gh-pages: all
	rm -rf gh-pages/
	mkdir gh-pages
	git config --get remote.$$(git remote | head -1).url
	git config --get remote.$$(git remote | head -1).url | (cd gh-pages && git init && git remote add origin $$(cat) && git checkout --orphan gh-pages)
	cp -r lib gh-pages
	mkdir gh-pages/src
	cp src/*.js gh-pages/src
	cp index.html gh-pages/
	(cd gh-pages && git add . && git commit -m "generated commit" && git push origin gh-pages -f)

.PHONY: clean gh-pages
