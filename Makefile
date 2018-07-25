
BUNDLE=dist/index_bundle.js

all: $(BUNDLE)

STATIC=client/icon.png client/cloud.svg
$(BUNDLE): $(STATIC) $(wildcard client/*.js) $(wildcard client/*.jsx) $(wildcard client/*.scss) $(wildcard client/components/*.jsx) $(wildcard client/components/*.js)
	yarn build
	cp $(STATIC) dist/

clean:
	rm $(BUNDLE)

dev:
	yarn start

test:
	yarn test