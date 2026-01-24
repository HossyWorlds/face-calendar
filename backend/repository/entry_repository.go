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

func (r *EntryRepository) GetByMonth(year, month int) ([]models.Entry, error) {
	query := `
		SELECT id, date, photo_url, person_name, location, time_of_day, memo, created_at, updated_at
		FROM encounters
		WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?
		ORDER BY date ASC
	`

	yearStr := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC).Format("2006")
	monthStr := time.Date(2000, time.Month(month), 1, 0, 0, 0, 0, time.UTC).Format("01")

	rows, err := database.DB.Query(query, yearStr, monthStr)
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

func (r *EntryRepository) GetByID(id string) (*models.Entry, error) {
	query := `
		SELECT id, date, photo_url, person_name, location, time_of_day, memo, created_at, updated_at
		FROM encounters
		WHERE id = ?
	`

	var entry models.Entry
	var location, memo sql.NullString
	var createdAt, updatedAt sql.NullTime

	err := database.DB.QueryRow(query, id).Scan(
		&entry.ID,
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
		INSERT INTO encounters (id, date, photo_url, person_name, location, time_of_day, memo, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	now := time.Now()
	entry.CreatedAt = now
	entry.UpdatedAt = now

	_, err := database.DB.Exec(query,
		entry.ID,
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
		SET photo_url = ?, person_name = ?, location = ?, time_of_day = ?, memo = ?, updated_at = ?
		WHERE id = ?
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
	)

	return err
}

func (r *EntryRepository) Delete(id string) error {
	query := `DELETE FROM encounters WHERE id = ?`
	_, err := database.DB.Exec(query, id)
	return err
}
