#[macro_use]
extern crate rocket;
use anyhow::Result;
use rocket::{
    form::{Form, FromForm},
    response::{
        stream::{Event, EventStream},
        Redirect,
    },
    serde::json::Json,
    State,
};
use serde::{Deserialize, Serialize, __private::de::Content};
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use std::env;
use tokio::{
    sync::broadcast::{self, Sender},
    try_join,
};

#[derive(Clone, PartialEq, Eq, Serialize)]
enum ChatEvent {
    NewRoom(String),
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

#[post("/add_room/<name>")]
async fn add_room(name: &str, context: &State<Context>) {
    let _ = context
        .sender
        .clone()
        .send(ChatEvent::NewRoom(name.to_owned()));
    println!("Adding room {name}");
}

#[get("/")]
async fn index(pool: &State<Pool<Postgres>>) -> Option<String> {
    let rooms = sqlx::query!("SELECT * FROM rooms")
        .fetch_one(&**pool)
        .await
        .ok()?;
    Some(format!("hi {n}", n = rooms.name))
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
        .mount("/", routes![index, events, add_room])
        .launch()
        .await?;

    Ok(())
}
