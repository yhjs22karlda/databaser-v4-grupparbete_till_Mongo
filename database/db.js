import sqlite3 from 'sqlite3'
sqlite3.verbose()

export const db = new sqlite3.Database('database/db.sqlite', (err) => {
  if (err) return console.error(err.message)
  console.log('Connected to SQlite database.')
});

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        createdAt INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS channels (
        channel_id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_name TEXT NOT NULL,
        owner INTEGER NOT NULL,
        FOREIGN KEY (owner) REFERENCES users (user_id)
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
        user_id INTEGER NOT NULL,
        channel_id INTEGER NOT NULL,
        PRIMARY KEY (user_id, channel_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (channel_id) REFERENCES channels (channel_id)
    );
    CREATE TABLE IF NOT EXISTS messages (
        message_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        text TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );
    CREATE TABLE IF NOT EXISTS messages_channels (
        message_id INTEGER NOT NULL,
        channel_id INTEGER NOT NULL,
        PRIMARY KEY (message_id, channel_id),
        FOREIGN KEY (message_id) REFERENCES messages (message_id),
        FOREIGN KEY (channel_id) REFERENCES channels (channel_id)
    );
    `,
    (err) => {
        if(err) return console.error(err.message)
        console.log("Tables OK!")
        // db.exec(insertStartData())
    }
)

function insertStartData() {
    const date = Date.now()
    return `
    INSERT INTO users (username, password, createdAt) VALUES ('User 1', 'abc123', ${date});
    INSERT INTO users (username, password, createdAt) VALUES ('User 2', 'abc456', ${date});

    INSERT INTO channels (channel_name, owner) VALUES ('Channel 1', 1);
    INSERT INTO channels (channel_name, owner) VALUES ('Channel 2', 2);

    INSERT INTO subscriptions (user_id, channel_id) VALUES (1, 1);
    INSERT INTO subscriptions (user_id, channel_id) VALUES (1, 2);
    `
}