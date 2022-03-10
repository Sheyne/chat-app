CREATE TABLE rooms (
    name TEXT NOT NULL PRIMARY KEY
);

CREATE TABLE messages (
    time timestamp NOT NULL DEFAULT NOW(),
    message TEXT NOT NULL,
    sender TEXT NOT NULL,
    room TEXT NOT NULL REFERENCES rooms(name)
);