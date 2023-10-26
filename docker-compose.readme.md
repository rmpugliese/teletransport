# How to run teletransport 
## Docker-compose based setup

### ENV file setup
Create an .env file with the following *VARS* (remove <> brackets):
```
CLOUDINARY_CLOUD_NAME=<yourname>
CLOUDINARY_KEY=<yourkey>
CLOUDINARY_SECRET=<the cloudinary secret>
MAPBOX_TOKEN=<the map token>
DB_URL=mongodb://mongo:27017/teletransport
SECRET=<a secret password>
ROBOT_ID=<knobot id>
```

### Persistence 
run the following command
`sudo mkdir -p /opt/persistence/mongodb_data`


