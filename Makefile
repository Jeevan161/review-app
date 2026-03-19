.PHONY: install install-client install-server build start start-client start-server docker-build docker-run clean

# Install all dependencies
install: install-client install-server

install-client:
	cd client && npm install

install-server:
	cd server && npm install

# Build client
build:
	cd client && npm install && npm run build

# Start both client and server
start:
	@echo "Starting server and client..."
	cd server && npm start & cd client && CHOKIDAR_USEPOLLING=true WATCHPACK_POLLING=true npm start

start-client:
	cd client && CHOKIDAR_USEPOLLING=true WATCHPACK_POLLING=true npm start

start-server:
	cd server && npm start

# Docker
docker-build:
	docker build -t review-app:latest .

docker-run:
	docker run -p 3000:3000 -p 4000:4000 review-app:latest

# Clean
clean:
	rm -rf client/build client/node_modules server/node_modules
