# Running:

```bash 
docker-compose --profile main-app build
docker-compose --profile main-app up
```

# Initialize Database (should only have to do once)

If running outside a dev container, make sure you've completed the above and the app is currently `up`.

```bash
docker-compose -f docker-compose.yml -f .devcontainer/docker-compose.extend.yml run -v $(pwd)/database.sql:/database.sql dev_container psql postgresql://postgres:postgres@db:5432 -f database.sql
```

If initializing from a dev-container, just use 

```bash
psql postgresql://postgres:postgres@db:5432 -f database.sql
```
