package handlers

import (
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
}

func GetUploadDir() string {
	dir := os.Getenv("UPLOAD_DIR")
	if dir == "" {
		dir = "../uploads"
	}
	return dir
}

func handlePhotoUpload(r *http.Request) (string, error) {
	file, header, err := r.FormFile("photo")
	if err != nil {
		if err == http.ErrMissingFile {
			return "", errors.New("no photo uploaded")
		}
		return "", err
	}
	defer file.Close()

	// Validate file extension
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExtensions[ext] {
		return "", errors.New("invalid file type. Allowed: jpg, jpeg, png, gif, webp")
	}

	// Generate unique filename
	filename := uuid.New().String() + ext

	// Ensure upload directory exists
	uploadDir := GetUploadDir()
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("[ERROR] Failed to create upload directory: %v", err)
		return "", errors.New("failed to process file upload")
	}

	// Create destination file
	destPath := filepath.Join(uploadDir, filename)
	dest, err := os.Create(destPath)
	if err != nil {
		log.Printf("[ERROR] Failed to create destination file: %v", err)
		return "", errors.New("failed to process file upload")
	}
	defer dest.Close()

	// Copy file content
	if _, err := io.Copy(dest, file); err != nil {
		log.Printf("[ERROR] Failed to copy file content: %v", err)
		return "", errors.New("failed to process file upload")
	}

	return fmt.Sprintf("/uploads/%s", filename), nil
}

// ServeUploads serves static files from the uploads directory
func ServeUploads(w http.ResponseWriter, r *http.Request) {
	filename := filepath.Base(r.URL.Path)

	// Prevent directory traversal
	if strings.Contains(filename, "..") {
		log.Printf("[WARNING] Directory traversal attempt: %s", r.URL.Path)
		http.Error(w, "file not found", http.StatusNotFound)
		return
	}

	filePath := filepath.Join(GetUploadDir(), filename)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.Error(w, "file not found", http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, filePath)
}
