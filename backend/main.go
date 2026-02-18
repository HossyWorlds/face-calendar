package main

import (
	"context"
	"face-calendar/database"
	"face-calendar/handlers"
	authMiddleware "face-calendar/middleware"
	"log"
	"net/http"
	"os"

	firebase "firebase.google.com/go/v4"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	// Initialize database
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.CloseDB()

	// Initialize Firebase (optional, will skip auth if not configured)
	firebaseApp, err := initializeFirebase()
	if err != nil {
		log.Printf("Warning: Firebase not configured: %v", err)
	} else if firebaseApp != nil {
		if err := authMiddleware.InitFirebaseAuth(firebaseApp); err != nil {
			log.Fatalf("Failed to initialize Firebase Auth: %v", err)
		}
	}

	// Create router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)

	// CORS configuration - get origins from environment
	allowedOrigins := []string{"http://localhost:3000"}
	if prodOrigin := os.Getenv("CORS_ALLOWED_ORIGINS"); prodOrigin != "" {
		allowedOrigins = append(allowedOrigins, prodOrigin)
	}

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Initialize handlers
	entryHandler := handlers.NewEntryHandler()

	// API routes with auth middleware
	r.Route("/api/v1", func(r chi.Router) {
		// Apply auth middleware to all API routes if Firebase is initialized
		if firebaseApp != nil {
			r.Use(authMiddleware.AuthMiddleware)
		}
		r.Get("/encounters", entryHandler.GetEntries)
		r.Post("/encounters", entryHandler.CreateEntry)
		r.Put("/encounters/{id}", entryHandler.UpdateEntry)
		r.Delete("/encounters/{id}", entryHandler.DeleteEntry)
	})

	// Serve uploaded files
	r.Get("/uploads/*", handlers.ServeUploads)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

// initializeFirebase は GOOGLE_APPLICATION_CREDENTIALS 環境変数を使って Firebase を初期化する。
// SDK が自動的にクレデンシャルを検出するため、コード内でファイルパスを指定する必要はない。
// Cloud Run 等の GCP 環境ではサービスアカウントが自動注入されるため、環境変数も不要。
//
// 参考: https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments
func initializeFirebase() (*firebase.App, error) {
	if os.Getenv("GOOGLE_APPLICATION_CREDENTIALS") == "" {
		return nil, nil // クレデンシャル未設定 → 認証なしで動作
	}

	app, err := firebase.NewApp(context.Background(), nil)
	if err != nil {
		return nil, err
	}

	return app, nil
}
