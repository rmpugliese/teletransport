pull:
		git pull
build: pull
		docker-compose build
start:
	  docker-compose up -d
stop:
	  docker-compose down
restart:
	  docker-compose restart
