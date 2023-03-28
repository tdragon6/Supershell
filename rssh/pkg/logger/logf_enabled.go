//go:build !nologging
// +build !nologging

package logger

import (
	"fmt"
	"log"
	"path/filepath"
	"runtime"
	"strings"
)

func (l *Logger) Ulogf(callerStackDepth int, u Urgency, format string, v ...interface{}) {
	pc, file, line, ok := runtime.Caller(callerStackDepth)
	if !ok {
		file = "?"
		line = 0
	}

	fn := runtime.FuncForPC(pc)
	var fnName string
	if fn == nil {
		fnName = "?()"
	} else {
		dotName := filepath.Ext(fn.Name())
		fnName = strings.TrimLeft(dotName, ".") + "()"
	}

	msg := fmt.Sprintf(format, v...)
	prefix := fmt.Sprintf("[%s] %s %s:%d %s : ", l.id, urgency(u), filepath.Base(file), line, fnName)

	log.Print(prefix, msg, "\n")
	if u == FATAL {
		panic("Log was used with FATAL")
	}
}
