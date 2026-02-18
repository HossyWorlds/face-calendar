package models

import "time"

type TimeOfDay string

const (
	Morning   TimeOfDay = "morning"
	Afternoon TimeOfDay = "afternoon"
	Evening   TimeOfDay = "evening"
)

type Entry struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	Date       string    `json:"date"` // YYYY-MM-DD
	PhotoURL   string    `json:"photo_url"`
	PersonName string    `json:"person_name"`
	Location   *string   `json:"location,omitempty"`
	TimeOfDay  TimeOfDay `json:"time_of_day"`
	Memo       *string   `json:"memo,omitempty"`
	CreatedAt  time.Time `json:"created_at,omitempty"`
	UpdatedAt  time.Time `json:"updated_at,omitempty"`
}

type CreateEntryRequest struct {
	Date       string    `json:"date"`
	PersonName string    `json:"person_name"`
	Location   string    `json:"location"`
	TimeOfDay  TimeOfDay `json:"time_of_day"`
	Memo       string    `json:"memo"`
}

type UpdateEntryRequest struct {
	PersonName *string    `json:"person_name,omitempty"`
	Location   *string    `json:"location,omitempty"`
	TimeOfDay  *TimeOfDay `json:"time_of_day,omitempty"`
	Memo       *string    `json:"memo,omitempty"`
}

type EntriesResponse struct {
	Entries []Entry `json:"entries"`
}
