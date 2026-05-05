package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestRequestIDMiddleware_reusesInboundHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)
	const want = "incoming-trace-abc"

	r := gin.New()
	r.Use(RequestIDMiddleware())
	r.GET("/health", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	req.Header.Set(HeaderRequestID, want)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	got := rec.Header().Get(HeaderRequestID)
	if got != want {
		t.Fatalf("response %s = %q, want %q", HeaderRequestID, got, want)
	}
}

func TestRequestIDMiddleware_generatesWhenMissing(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.Use(RequestIDMiddleware())
	r.GET("/health", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	got := rec.Header().Get(HeaderRequestID)
	if got == "" || strings.Contains(got, " ") {
		t.Fatalf("expected non-empty generated ID, got %q", got)
	}
	// 16 random bytes -> 32 hex chars
	if len(got) != 32 && !strings.HasPrefix(got, "reqid-fallback-") {
		t.Fatalf("unexpected id shape: %q", got)
	}
}

func TestRequestIDMiddleware_setsContext(t *testing.T) {
	gin.SetMode(gin.TestMode)
	const want = "ctx-check-123"

	r := gin.New()
	r.Use(RequestIDMiddleware())
	r.GET("/echo", func(c *gin.Context) {
		id, ok := c.Get(ContextKeyRequestID)
		if !ok {
			t.Fatal("request_id missing from gin context")
		}
		idStr, ok := id.(string)
		if !ok || idStr != want {
			t.Fatalf("context request_id = %v (%q), want %q", id, idStr, want)
		}
		c.String(http.StatusOK, idStr)
	})

	req := httptest.NewRequest(http.MethodGet, "/echo", nil)
	req.Header.Set(HeaderRequestID, want)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	if rec.Body.String() != want || rec.Code != http.StatusOK {
		t.Fatalf("unexpected response: %d %q", rec.Code, rec.Body.String())
	}
}
