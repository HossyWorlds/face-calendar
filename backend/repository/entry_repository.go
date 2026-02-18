package repository

import (
	"database/sql"
	"face-calendar/database"
	"face-calendar/models"
	"time"
)

type EntryRepository struct{}

func NewEntryRepository() *EntryRepository {
	return &EntryRepository{}
}

func (r *EntryRepository) GetByMonth(year, month int, userID string) ([]models.Entry, error) {
	query := `
		SELECT id, user_id, date::text, photo_url, person_name, location, time_of_day, memo, created_at, updated_at
		FROM encounters
		WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3
		ORDER BY date ASC
	`

	rows, err := database.DB.Query(query, userID, year, month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []models.Entry
	for rows.Next() {
		var entry models.Entry
		var location, memo sql.NullString
		var createdAt, updatedAt sql.NullTime

		err := rows.Scan(
			&entry.ID,
			&entry.UserID,
			&entry.Date,
			&entry.PhotoURL,
			&entry.PersonName,
			&location,
			&entry.TimeOfDay,
			&memo,
			&createdAt,
			&updatedAt,
		)
		if err != nil {
			return nil, err
		}

		if location.Valid {
			entry.Location = &location.String
		}
		if memo.Valid {
			entry.Memo = &memo.String
		}
		if createdAt.Valid {
			entry.CreatedAt = createdAt.Time
		}
		if updatedAt.Valid {
			entry.UpdatedAt = updatedAt.Time
		}

		entries = append(entries, entry)
	}

	return entries, nil
}

func (r *EntryRepository) GetByID(id, userID string) (*models.Entry, error) {
	query := `
		SELECT id, user_id, date::text, photo_url, person_name, location, time_of_day, memo, created_at, updated_at
		FROM encounters
		WHERE id = $1 AND user_id = $2
	`

	var entry models.Entry
	var location, memo sql.NullString
	var createdAt, updatedAt sql.NullTime

	err := database.DB.QueryRow(query, id, userID).Scan(
		&entry.ID,
		&entry.UserID,
		&entry.Date,
		&entry.PhotoURL,
		&entry.PersonName,
		&location,
		&entry.TimeOfDay,
		&memo,
		&createdAt,
		&updatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if location.Valid {
		entry.Location = &location.String
	}
	if memo.Valid {
		entry.Memo = &memo.String
	}
	if createdAt.Valid {
		entry.CreatedAt = createdAt.Time
	}
	if updatedAt.Valid {
		entry.UpdatedAt = updatedAt.Time
	}

	return &entry, nil
}

func (r *EntryRepository) Create(entry *models.Entry) error {
	query := `
		INSERT INTO encounters (id, user_id, date, photo_url, person_name, location, time_of_day, memo, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	now := time.Now()
	entry.CreatedAt = now
	entry.UpdatedAt = now

	_, err := database.DB.Exec(query,
		entry.ID,
		entry.UserID,
		entry.Date,
		entry.PhotoURL,
		entry.PersonName,
		entry.Location,
		entry.TimeOfDay,
		entry.Memo,
		entry.CreatedAt,
		entry.UpdatedAt,
	)

	return err
}

func (r *EntryRepository) Update(entry *models.Entry) error {
	query := `
		UPDATE encounters
		SET photo_url = $1, person_name = $2, location = $3, time_of_day = $4, memo = $5, updated_at = $6
		WHERE id = $7 AND user_id = $8
	`

	entry.UpdatedAt = time.Now()

	_, err := database.DB.Exec(query,
		entry.PhotoURL,
		entry.PersonName,
		entry.Location,
		entry.TimeOfDay,
		entry.Memo,
		entry.UpdatedAt,
		entry.ID,
		entry.UserID,
	)

	return err
}

func (r *EntryRepository) Delete(id, userID string) error {
	query := `DELETE FROM encounters WHERE id = $1 AND user_id = $2`
	_, err := database.DB.Exec(query, id, userID)
	return err
}
