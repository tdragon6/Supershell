package logger

type Urgency int

const (
	INFO Urgency = iota
	WARN
	ERROR
	FATAL
)

type Logger struct {
	id string
}

func (l *Logger) Info(format string, v ...interface{}) {
	l.Ulogf(2, INFO, format, v...)
}

func (l *Logger) Warning(format string, v ...interface{}) {
	l.Ulogf(2, WARN, format, v...)
}

func (l *Logger) Error(format string, v ...interface{}) {
	l.Ulogf(2, ERROR, format, v...)
}

func (l *Logger) Fatal(format string, v ...interface{}) {
	l.Ulogf(2, FATAL, format, v...)
}

func urgency(u Urgency) string {
	switch u {
	case INFO:
		return "INFO"
	case WARN:
		return "WARNING"
	case ERROR:
		return "ERROR"
	case FATAL:
		return "FATAL"
	}

	return "UNKNOWN_URGENCY"
}

func NewLog(id string) Logger {
	var l Logger
	l.id = id
	return l
}
