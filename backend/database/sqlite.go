package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB(dbPath string) error {
	var err error
	DB, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return err
	}

	if err = DB.Ping(); err != nil {
		return err
	}

	if err = createTables(); err != nil {
		return err
	}

	log.Println("Database initialized successfully")
	return nil
}

func createTables() error {
	schema := `
	CREATE TABLE IF NOT EXISTS encounters (
		id TEXT PRIMARY KEY,
		date DATE UNIQUE NOT NULL,
		photo_url TEXT NOT NULL,
		person_name TEXT NOT NULL,
		location TEXT,
		time_of_day TEXT CHECK(time_of_day IN ('morning', 'afternoon', 'evening')) NOT NULL,
		memo TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_encounters_date ON encounters(date);
	`

	_, err := DB.Exec(schema)
	return err
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}

func GetDBPath() string {
	path := os.Getenv("DATABASE_PATH")
	if path == "" {
		path = "./face_calendar.db"
	}
	return path
}
