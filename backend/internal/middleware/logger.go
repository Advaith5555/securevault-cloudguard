package middleware

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

type requestLogLine struct {
	Timestamp string `json:"timestamp"`
	RequestID string `json:"request_id"`
	Method    string `json:"method"`
	Path      string `json:"path"`
	Status    int    `json:"status"`
	LatencyMs int64  `json:"latency_ms"`
	ClientIP  string `json:"client_ip"`
	UserAgent string `json:"user_agent"`
}

// StructuredLogger writes one JSON object per finished request (stdout via log).
// It does not log Authorization, bodies, or other sensitive fields.
func StructuredLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		defer func() {
			rid, _ := c.Get(ContextKeyRequestID)
			ridStr, _ := rid.(string)
			if ridStr == "" {
				ridStr = "-"
			}

			line := requestLogLine{
				Timestamp: time.Now().UTC().Format(time.RFC3339Nano),
				RequestID: ridStr,
				Method:    c.Request.Method,
				Path:      path,
				Status:    c.Writer.Status(),
				LatencyMs: time.Since(start).Milliseconds(),
				ClientIP:  c.ClientIP(),
				UserAgent: c.Request.UserAgent(),
			}

			data, err := json.Marshal(line)
			if err != nil {
				log.Printf(`{"error":"middleware_logger_marshal","detail":%q}`, err.Error())
				return
			}
			log.Println(string(data))
		}()

		c.Next()
	}
}
