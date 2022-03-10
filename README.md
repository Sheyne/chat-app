# Running:

```bash 
docker-compose --profile main-app build
docker-compose --profile main-app up
```

# Initialize Database (should only have to do once)

```bash
docker-compose run app psql postgresql://postgres:postgres@db:5432 -f database.sql
```

If initializing from a dev-container, just use 

```bash
psql postgresql://postgres:postgres@db:5432 -f database.sql
```
