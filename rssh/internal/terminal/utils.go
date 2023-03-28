package terminal

import (
	"errors"
	"fmt"
	"strings"
)

var ErrFlagNotSet = errors.New("Flag not set")

type Node interface {
	Value() string
	Start() int
	End() int
	Type() string
}

type baseNode struct {
	start, end int
	value      string
}

func (bn *baseNode) Value() string {
	return bn.value
}

func (bn *baseNode) Start() int {
	return bn.start
}

func (bn *baseNode) End() int {
	return bn.end
}

type Argument struct {
	baseNode
}

func (a Argument) Type() string {
	return "argument"
}

type Cmd struct {
	baseNode
}

func (c Cmd) Type() string {
	return "command"
}

type Flag struct {
	baseNode

	Args []Argument
	long bool
}

func (f Flag) Type() string {
	return "flag"
}

func (f *Flag) ArgValues() (out []string) {
	for _, v := range f.Args {
		out = append(out, v.Value())
	}
	return
}

type ParsedLine struct {
	Chunks []string

	FlagsOrdered []Flag
	Flags        map[string]Flag

	Arguments []Argument
	Focus     Node

	Section *Flag

	Command *Cmd

	RawLine string
}

func (pl *ParsedLine) Empty() bool {
	return pl.RawLine == ""
}

func (pl *ParsedLine) ArgumentsAsStrings() (out []string) {
	for _, v := range pl.Arguments {
		out = append(out, v.Value())
	}
	return
}

func (pl *ParsedLine) IsSet(flag string) bool {
	_, ok := pl.Flags[flag]
	return ok
}

func (pl *ParsedLine) ExpectArgs(flag string, needs int) ([]Argument, error) {
	f, ok := pl.Flags[flag]
	if ok {
		if len(f.Args) != needs {
			return nil, fmt.Errorf("flag: %s expects %d arguments", flag, needs)
		}
		return f.Args, nil
	}
	return nil, ErrFlagNotSet
}

func (pl *ParsedLine) GetArgs(flag string) ([]Argument, error) {
	f, ok := pl.Flags[flag]
	if ok {
		return f.Args, nil
	}
	return nil, ErrFlagNotSet
}

func (pl *ParsedLine) GetArgsString(flag string) ([]string, error) {
	f, ok := pl.Flags[flag]
	if ok {
		return f.ArgValues(), nil
	}
	return nil, ErrFlagNotSet
}

func (pl *ParsedLine) GetArg(flag string) (Argument, error) {
	arg, err := pl.ExpectArgs(flag, 1)
	if err != nil {
		return Argument{}, err
	}

	return arg[0], nil
}

// Gets a single argument, will return error if flag is not set, or if it has no contents (e.g --blah)
func (pl *ParsedLine) GetArgString(flag string) (string, error) {
	f, ok := pl.Flags[flag]
	if !ok {
		return "", ErrFlagNotSet
	}

	if len(f.Args) == 0 {
		return "", fmt.Errorf("flag: %s expects at least 1 argument", flag)
	}
	return f.Args[0].Value(), nil

}

func parseFlag(line string, startPos int) (f Flag, endPos int) {

	f.start = startPos
	linked := true
	for f.end = startPos; f.end < len(line); f.end++ {
		endPos = f.end
		if line[f.end] == ' ' {

			return
		}

		if line[f.end] == '-' && linked {
			continue
		}

		if f.end-startPos > 1 && linked {
			f.long = true
		}

		linked = false

		f.value += string(line[f.end])
	}

	return
}

func parseSingleArg(line string, startPos int) (arg Argument, endPos int) {

	var (
		inString        = false
		stringDelimiter = byte(0)
		literalNext     = false
	)

	arg.start = startPos

	var sb strings.Builder

	defer func() {
		arg.value = sb.String()
	}()

	for arg.end = startPos; arg.end < len(line); arg.end++ {
		endPos = arg.end

		if !inString && (line[endPos] == '"' || line[endPos] == '\'' || line[endPos] == '`') {

			inString = true
			stringDelimiter = line[endPos]

			continue
		}

		if !literalNext {

			if line[endPos] == '\\' {
				literalNext = true
				continue
			}

			if inString && line[endPos] == stringDelimiter {
				stringDelimiter = byte(0)
				inString = false
				continue
			}

			if line[endPos] == ' ' && !inString {
				return
			}
		}

		sb.WriteByte(line[endPos])

		arg.end = endPos

		if literalNext {
			literalNext = false
		}
	}

	return
}

func parseArgs(line string, startPos int) (args []Argument, endPos int) {

	for endPos = startPos; endPos < len(line); endPos++ {

		var arg Argument
		arg, endPos = parseSingleArg(line, endPos)

		if len(arg.value) != 0 {
			args = append(args, arg)
		}

		if endPos != len(line)-1 && line[endPos+1] == '-' {
			return
		}
	}

	return
}

func ParseLineValidFlags(line string, cursorPosition int, validFlags map[string]bool) (pl ParsedLine, err error) {
	pl = ParseLine(line, cursorPosition)

	for flag := range pl.Flags {
		_, ok := validFlags[flag]
		if !ok {
			return ParsedLine{}, fmt.Errorf("flag provided but not defined: '%s'", flag)
		}
	}

	return pl, nil
}

func ParseLine(line string, cursorPosition int) (pl ParsedLine) {

	var capture *Flag = nil
	pl.Flags = make(map[string]Flag)
	pl.RawLine = line

	for i := 0; i < len(line); i++ {

		if line[i] == '-' {

			if capture != nil {

				if prev, ok := pl.Flags[capture.Value()]; ok {
					capture.Args = append(capture.Args, prev.Args...)
				}

				pl.Flags[capture.Value()] = *capture
				pl.FlagsOrdered = append(pl.FlagsOrdered, *capture)
			}

			var newFlag Flag
			newFlag, i = parseFlag(line, i)
			if cursorPosition >= newFlag.start && cursorPosition <= newFlag.end {
				pl.Focus = &newFlag
				pl.Section = &newFlag
			}

			pl.Chunks = append(pl.Chunks, pl.RawLine[newFlag.start:newFlag.end])

			//First start parsing long options --blah
			if newFlag.long {
				capture = &newFlag
				continue
			}

			//Start short option parsing -l or -ltab = -l -t -a -b

			//For a single option, its not ambigous for what option we're capturing an arg for
			if len(newFlag.Value()) == 1 {
				capture = &newFlag
				continue
			}

			//Most of the time its ambigous with multiple options in one flag, e.g -aft what arg goes with what option?
			capture = nil
			for _, c := range newFlag.Value() {
				//Due to embedded struct this has to be like this
				var f Flag
				f.start = newFlag.start
				f.end = i
				f.value = string(c)

				pl.Flags[f.Value()] = f
				pl.FlagsOrdered = append(pl.FlagsOrdered, f)
			}
			continue

		}

		var args []Argument
		args, i = parseArgs(line, i)

		for m, arg := range args {
			pl.Chunks = append(pl.Chunks, arg.value)

			if cursorPosition >= arg.start && cursorPosition <= arg.end {
				pl.Focus = &args[m]

				pl.Section = capture
			}
		}

		if pl.Command == nil && len(args) > 0 && capture == nil {
			pl.Command = new(Cmd)
			pl.Command.value = args[0].value
			pl.Command.start = args[0].start
			pl.Command.end = args[0].end

			if cursorPosition >= pl.Command.start && cursorPosition <= pl.Command.end {
				pl.Focus = pl.Command
			}

			args = args[1:]
		}

		pl.Arguments = append(pl.Arguments, args...)

		if capture != nil {
			capture.Args = args
			continue
		}

	}

	if capture != nil {
		if prev, ok := pl.Flags[capture.Value()]; ok {
			capture.Args = append(capture.Args, prev.Args...)
		}
		pl.Flags[capture.Value()] = *capture
		pl.FlagsOrdered = append(pl.FlagsOrdered, *capture)
	}

	var closestLeft *Flag

	for i := len(pl.FlagsOrdered) - 1; i >= 0; i-- {
		if cursorPosition >= pl.FlagsOrdered[i].start && cursorPosition <= pl.FlagsOrdered[i].end {
			pl.Section = &pl.FlagsOrdered[i]
			break
		}

		if pl.FlagsOrdered[i].end > cursorPosition {
			continue
		}

		closestLeft = &pl.FlagsOrdered[i]
		break
	}

	if pl.Section == nil && closestLeft != nil {
		pl.Section = closestLeft
	}

	return

}

func MakeHelpText(lines ...string) (s string) {
	for _, v := range lines {
		s += v + "\n"
	}

	return s
}
