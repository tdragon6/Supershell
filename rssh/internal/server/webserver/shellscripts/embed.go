package shellscripts

import (
	"bytes"
	"embed"
	"io"
	"text/template"
)

//go:embed templates/*
var shellTemplates embed.FS

type Args struct {
	Protocol string
	Host     string
	Port     string
	Name     string
	Arch     string
	OS       string
}

func MakeTemplate(attributes Args, extension string) ([]byte, error) {

	file, err := shellTemplates.Open("templates/" + extension)
	if err != nil {
		return nil, err
	}

	t, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	template, err := template.New("shell").Parse(string(t))
	if err != nil {
		return nil, err
	}

	var b bytes.Buffer
	err = template.Execute(&b, attributes)
	if err != nil {
		return nil, err
	}

	return b.Bytes(), nil

}
