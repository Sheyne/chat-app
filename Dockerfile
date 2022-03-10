# [Choice] Debian OS version (use bullseye on local arm64/Apple Silicon): buster, bullseye
ARG VARIANT="bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/rust:0-${VARIANT} as dev_container

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
   && apt-get -y install clang lld npm postgresql musl-tools \
   && apt-get autoremove -y && apt-get clean -y \
   && npm install -g typescript

FROM dev_container as build_container
ADD database.sql /
RUN mkdir -p /rust_build/src
ADD Cargo.toml Cargo.lock /rust_build/
ADD src /rust_build/src
RUN service postgresql start && \
   sudo -u postgres createdb root && \
   sudo -u postgres createuser root && \
   psql -c "alter user root password 'root';" && psql -f /database.sql \
   && cd /rust_build && DATABASE_URL=postgresql://root:root@localhost \
   cargo build --release
ADD typescript typescript
RUN cd typescript && npm run build

FROM debian:latest as run_container
COPY --from=build_container /rust_build/target/release/chat_app /chat_app
COPY --from=build_container /typescript/build /typescript/build
CMD ["/chat_app"]

