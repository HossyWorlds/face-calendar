package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() error {
	dsn := GetDSN()

	var err error
	DB, err = sql.Open("postgres", dsn)
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
		user_id TEXT NOT NULL,
		date DATE NOT NULL,
		photo_url TEXT NOT NULL,
		person_name TEXT NOT NULL,
		location TEXT,
		time_of_day TEXT CHECK(time_of_day IN ('morning', 'afternoon', 'evening')) NOT NULL,
		memo TEXT,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW(),
		UNIQUE(user_id, date)
	);

	CREATE INDEX IF NOT EXISTS idx_encounters_user_id ON encounters(user_id);
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

// GetDSN は DATABASE_URL 環境変数から接続文字列を取得する。
// ローカル: postgres://postgres:postgres@localhost:5432/face_calendar?sslmode=disable
// Supabase: postgres://postgres.[ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
func GetDSN() string {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@localhost:5432/face_calendar?sslmode=disable"
	}
	return dsn
}
