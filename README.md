# Running:

```bash 
docker-compose up
```

# Initialize Database (should only have to do once)

```bash
docker-compose run app psql postgresql://postgres:postgres@db:5432 -f database.sql
```