package commands

import (
	"errors"
	"fmt"
	"io"
	"path"
	"sort"
	"strings"

	"github.com/NHAS/reverse_ssh/internal/server/webserver"
	"github.com/NHAS/reverse_ssh/internal/terminal"
	"github.com/NHAS/reverse_ssh/internal/terminal/autocomplete"
	"github.com/NHAS/reverse_ssh/pkg/table"
)

type link struct {
}

func (l *link) Run(tty io.ReadWriter, line terminal.ParsedLine) error {

	if line.IsSet("h") || line.IsSet("help") {
		return errors.New(l.Help(false))
	}

	if toList, ok := line.Flags["l"]; ok {
		t, _ := table.NewTable("Active Files", "Url", "Client Callback", "GOOS", "GOARCH", "Version", "Type", "Hits")

		files, err := webserver.List(strings.Join(toList.ArgValues(), " "))
		if err != nil {
			return err
		}

		ids := []string{}
		for id := range files {
			ids = append(ids, id)
		}

		sort.Strings(ids)

		for _, id := range ids {
			file := files[id]

			t.AddValues("http://"+path.Join(webserver.DefaultConnectBack, id), file.CallbackAddress, file.Goos, file.Goarch, file.Version, file.FileType, fmt.Sprintf("%d", file.Hits))
		}

		t.Fprint(tty)

		return nil

	}

	if toRemove, ok := line.Flags["r"]; ok {
		if len(toRemove.Args) == 0 {
			fmt.Fprintf(tty, "No argument supplied\n")

			return nil
		}

		files, err := webserver.List(strings.Join(toRemove.ArgValues(), " "))
		if err != nil {
			return err
		}

		if len(files) == 0 {
			return errors.New("No links match")
		}

		for id := range files {
			err := webserver.Delete(id)
			if err != nil {
				fmt.Fprintf(tty, "Unable to remove %s: %s\n", id, err)
				continue
			}
			fmt.Fprintf(tty, "Removed %s\n", id)
		}

		return nil

	}

	goos, err := line.GetArgString("goos")
	if err != nil && err != terminal.ErrFlagNotSet {
		return err
	}

	goarch, err := line.GetArgString("goarch")
	if err != nil && err != terminal.ErrFlagNotSet {
		return err
	}

	homeserver_address, err := line.GetArgString("s")
	if err != nil && err != terminal.ErrFlagNotSet {
		return err
	}

	name, err := line.GetArgString("name")
	if err != nil && err != terminal.ErrFlagNotSet {
		return err
	}

	comment, err := line.GetArgString("C")
	if err != nil && err != terminal.ErrFlagNotSet {
		return err
	}

	fingerprint, err := line.GetArgString("fingerprint")
	if err != nil && err != terminal.ErrFlagNotSet {
		return err
	}

	url, err := webserver.Build(goos, goarch, homeserver_address, fingerprint, name, comment, line.IsSet("shared-object"), line.IsSet("upx"), line.IsSet("garble"))
	if err != nil {
		return err
	}

	fmt.Fprintln(tty, url)

	return nil
}

func (l *link) Expect(line terminal.ParsedLine) []string {
	if line.Section != nil {
		switch line.Section.Value() {
		case "l", "r":
			return []string{autocomplete.WebServerFileIds}
		}
	}

	return nil
}

func (e *link) Help(explain bool) string {
	if explain {
		return "Generate client binary and return link to it"
	}

	return terminal.MakeHelpText(
		"link [OPTIONS]",
		"Link will compile a client and serve the resulting binary on a link which is returned.",
		"This requires the web server component has been enabled.",
		"\t-s\tSet homeserver address, defaults to server --external_address if set, or server listen address if not.",
		"\t-l\tList currently active download links",
		"\t-r\tRemove download link",
		"\t-C\tComment to add as the public key (acts as the name)",
		"\t--goos\tSet the target build operating system (default to runtime GOOS)",
		"\t--goarch\tSet the target build architecture (default to runtime GOARCH)",
		"\t--name\tSet link name",
		"\t--shared-object\tGenerate shared object file",
		"\t--fingerprint\tSet RSSH server fingerprint will default to server public key",
		"\t--upx\tUse upx to compress the final binary (requires upx to be installed)",
		"\t--garble\tUse garble to obfuscate the binary (requires garble to be installed)",
	)
}

func Link() *link {
	return &link{}
}
