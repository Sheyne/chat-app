#[macro_use]
extern crate rocket;
use anyhow::Result;
use rocket::fs::FileServer;
use rocket::{
    response::stream::{Event, EventStream},
    serde::json::Json,
    State,
};
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, types::time::PrimitiveDateTime, Pool, Postgres};
use std::env;
use tokio::sync::broadcast::{self, Sender};

#[derive(Clone, PartialEq, Eq, Serialize)]
enum ChatEvent {
    NewRoom(String),
    NewMessage(Message),
}

struct Context {
    sender: Sender<ChatEvent>,
}

impl Default for Context {
    fn default() -> Self {
        let (s, _) = broadcast::channel(16);

        Self { sender: s }
    }
}

#[get("/events")]
fn events(context: &State<Context>) -> EventStream![] {
    let mut receiver = context.sender.subscribe();

    EventStream! {
        loop {
            if let Ok(event) = receiver.recv().await {
                yield Event::json(&event);
            }
        }
    }
}

#[derive(Deserialize, Clone)]
struct RoomName<'a> {
    name: &'a str,
}

#[post("/add_room", data = "<name>", format = "json")]
async fn add_room(
    name: Json<RoomName<'_>>,
    context: &State<Context>,
    pool: &State<Pool<Postgres>>,
) -> Option<Json<bool>> {
    sqlx::query!("INSERT INTO rooms (name) VALUES ($1)", name.name)
        .execute(&**pool)
        .await
        .ok()?;

    let _ = context
        .sender
        .clone()
        .send(ChatEvent::NewRoom(name.name.to_owned()));

    Some(Json(true))
}

#[derive(Deserialize, Clone)]
struct SendMessage<'a> {
    sender: &'a str,
    message: &'a str,
    room: &'a str,
}

#[post("/send_message", data = "<message>", format = "json")]
async fn send_message(
    message: Json<SendMessage<'_>>,
    context: &State<Context>,
    pool: &State<Pool<Postgres>>,
) -> Option<Json<bool>> {
    let message = sqlx::query_as!(
        PostgresMessage,
        "INSERT INTO messages (sender, message, room) VALUES ($1, $2, $3) RETURNING *",
        message.sender,
        message.message,
        message.room
    )
    .fetch_one(&**pool)
    .await
    .map_err(|x| dbg!(x))
    .ok()?;

    let _ = context
        .sender
        .clone()
        .send(ChatEvent::NewMessage(message.into()));

    Some(Json(true))
}

#[get("/list_rooms")]
async fn list_rooms(pool: &State<Pool<Postgres>>) -> Option<Json<Vec<String>>> {
    let rooms = sqlx::query!(
        "
    SELECT name FROM rooms
        LEFT JOIN messages ON messages.room = rooms.name
    GROUP BY rooms.name
    ORDER BY GREATEST(MAX(messages.time), rooms.created) DESC
    "
    )
    .fetch_all(&**pool)
    .await
    .ok()?;
    Some(Json(rooms.into_iter().map(|x| x.name).collect()))
}

#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
struct Message {
    sender: String,
    room: String,
    message: String,
    time: String,
}

struct PostgresMessage {
    sender: String,
    room: String,
    message: String,
    time: PrimitiveDateTime,
}

impl From<PostgresMessage> for Message {
    fn from(m: PostgresMessage) -> Self {
        Message {
            sender: m.sender,
            message: m.message,
            time: format!(
                "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}",
                m.time.year(),
                m.time.month(),
                m.time.day(),
                m.time.hour(),
                m.time.minute(),
                m.time.second()
            ),
            room: m.room,
        }
    }
}

#[get("/list_messages/<room>")]
async fn list_messages(room: &str, pool: &State<Pool<Postgres>>) -> Option<Json<Vec<Message>>> {
    let rooms = sqlx::query_as!(
        PostgresMessage,
        "
        SELECT * FROM (
            SELECT *
            FROM messages
            WHERE room = $1
            ORDER BY time DESC
            LIMIT 50
        ) as x ORDER BY time ASC
        ",
        room
    )
    .fetch_all(&**pool)
    .await
    .ok()?;
    Some(Json(rooms.into_iter().map(<_ as Into<_>>::into).collect()))
}

#[rocket::main]
async fn main() -> Result<()> {
    let database_url = env::var("DATABASE_URL")?;

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    let context: Context = Default::default();

    rocket::build()
        .manage(pool)
        .manage(context)
        .mount(
            "/",
            routes![list_rooms, events, add_room, send_message, list_messages],
        )
        .mount("/", FileServer::from("./typescript/build"))
        .launch()
        .await?;

    Ok(())
}
