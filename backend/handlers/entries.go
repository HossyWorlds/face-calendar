package handlers

import (
	"encoding/json"
	"face-calendar/middleware"
	"face-calendar/models"
	"face-calendar/repository"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// respondError logs the error and returns a user-friendly message
func respondError(w http.ResponseWriter, statusCode int, userMessage string, err error) {
	if err != nil {
		log.Printf("[ERROR] %s: %v", userMessage, err)
	}
	http.Error(w, userMessage, statusCode)
}

type EntryHandler struct {
	repo *repository.EntryRepository
}

func NewEntryHandler() *EntryHandler {
	return &EntryHandler{
		repo: repository.NewEntryRepository(),
	}
}

// GET /encounters?year=2025&month=1
func (h *EntryHandler) GetEntries(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromContext(r)
	if userID == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	yearStr := r.URL.Query().Get("year")
	monthStr := r.URL.Query().Get("month")

	if yearStr == "" || monthStr == "" {
		http.Error(w, "year and month are required", http.StatusBadRequest)
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		http.Error(w, "invalid year", http.StatusBadRequest)
		return
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil || month < 1 || month > 12 {
		http.Error(w, "invalid month", http.StatusBadRequest)
		return
	}

	entries, err := h.repo.GetByMonth(year, month, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to retrieve entries", err)
		return
	}

	if entries == nil {
		entries = []models.Entry{}
	}

	response := models.EntriesResponse{Entries: entries}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// POST /encounters
func (h *EntryHandler) CreateEntry(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromContext(r)
	if userID == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse multipart form (max 10MB)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "failed to parse form", http.StatusBadRequest)
		return
	}

	date := r.FormValue("date")
	personName := r.FormValue("person_name")
	location := r.FormValue("location")
	timeOfDay := r.FormValue("time_of_day")
	memo := r.FormValue("memo")

	if date == "" || personName == "" || timeOfDay == "" {
		http.Error(w, "date, person_name, and time_of_day are required", http.StatusBadRequest)
		return
	}

	// Validate time_of_day
	if timeOfDay != "morning" && timeOfDay != "afternoon" && timeOfDay != "evening" {
		http.Error(w, "invalid time_of_day", http.StatusBadRequest)
		return
	}

	// Handle photo upload
	photoURL, err := handlePhotoUpload(r)
	if err != nil {
		// handlePhotoUpload returns user-friendly messages for validation errors
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if photoURL == "" {
		http.Error(w, "photo is required", http.StatusBadRequest)
		return
	}

	entry := &models.Entry{
		ID:         uuid.New().String(),
		UserID:     userID,
		Date:       date,
		PhotoURL:   photoURL,
		PersonName: personName,
		TimeOfDay:  models.TimeOfDay(timeOfDay),
	}

	if location != "" {
		entry.Location = &location
	}
	if memo != "" {
		entry.Memo = &memo
	}

	if err := h.repo.Create(entry); err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") {
			http.Error(w, "Entry already exists for this date", http.StatusConflict)
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create entry", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(entry)
}

// PUT /encounters/:id
func (h *EntryHandler) UpdateEntry(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromContext(r)
	if userID == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}

	existing, err := h.repo.GetByID(id, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to retrieve entry", err)
		return
	}
	if existing == nil {
		http.Error(w, "entry not found", http.StatusNotFound)
		return
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "failed to parse form", http.StatusBadRequest)
		return
	}

	// Update fields if provided
	if personName := r.FormValue("person_name"); personName != "" {
		existing.PersonName = personName
	}
	if location := r.FormValue("location"); location != "" {
		existing.Location = &location
	}
	if timeOfDay := r.FormValue("time_of_day"); timeOfDay != "" {
		if timeOfDay != "morning" && timeOfDay != "afternoon" && timeOfDay != "evening" {
			http.Error(w, "invalid time_of_day", http.StatusBadRequest)
			return
		}
		existing.TimeOfDay = models.TimeOfDay(timeOfDay)
	}
	if memo := r.FormValue("memo"); memo != "" {
		existing.Memo = &memo
	}

	// Handle optional photo upload
	photoURL, err := handlePhotoUpload(r)
	if err != nil && err.Error() != "no photo uploaded" {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if photoURL != "" {
		existing.PhotoURL = photoURL
	}

	if err := h.repo.Update(existing); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update entry", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existing)
}

// DELETE /encounters/:id
func (h *EntryHandler) DeleteEntry(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserIDFromContext(r)
	if userID == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}

	existing, err := h.repo.GetByID(id, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to retrieve entry", err)
		return
	}
	if existing == nil {
		http.Error(w, "entry not found", http.StatusNotFound)
		return
	}

	if err := h.repo.Delete(id, userID); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete entry", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
