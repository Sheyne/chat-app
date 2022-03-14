# Running:

```bash 
docker-compose --profile main-app build
docker-compose --profile main-app up
```

# Initialize Database (should only have to do once)

```bash
docker-compose -f docker-compose.yml -f .devcontainer/docker-compose.extend.yml run -v $(pwd)/database.sql:/database.sql dev_container psql postgresql://postgres:postgres@db:5432 -f database.sql
```

If initializing from a dev-container, just use 

```bash
psql postgresql://postgres:postgres@db:5432 -f database.sql
```
