FROM postgres:16-alpine

# Copy database initialization SQL script into Docker's entrypoint initialization directory
COPY init.sql /docker-entrypoint-initdb.d/01-init.sql

EXPOSE 5432
