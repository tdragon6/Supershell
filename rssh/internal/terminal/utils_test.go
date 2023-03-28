package terminal

import (
	"fmt"
	"testing"
)

func TestBasicValid(t *testing.T) {
	line := ParseLine("toaster --long_arg test -t a", 0)

	if line.Command == nil {
		t.Fatal("Line command is nil")
	}

	if line.Command.Value() != "toaster" {
		t.Fatalf("Expected 'toaster' as command, got %s", line.Command.Value())
	}

	if len(line.Arguments) != 2 {
		t.Fatalf("Parsed line should have 2 arguments, has %d", len(line.Arguments))
	}

	c, err := line.GetArgString("long_arg")
	if err != nil {
		t.Fatalf("Did not expect to get an error here: %s", err)
	}

	if c != "test" {
		t.Fatalf("Expected --long_arg to have value 'test', has %s", c)
	}

	c, err = line.GetArgString("t")
	if err != nil {
		t.Fatalf("Did not expect to get an error here: %s", err)
	}

	if c != "a" {
		t.Fatalf("Expected -t to have value 'a', has %s", c)
	}

	if line.Focus.Type() != line.Command.Type() && line.Focus.Value() == line.Command.Value() {
		t.Fatalf("Cursor is set to focus on command, however focus variable is not set to command: focus: %v", line.Focus)
	}

}

func TestNoFlags(t *testing.T) {
	line := ParseLine("kill 127.0.0.1:49962", 0)

	fmt.Println(line)

	if len(line.Arguments) != 1 {
		t.Fatalf("Expected one argument, got %d", len(line.Arguments))
	}

	if line.Arguments[0].Value() != "127.0.0.1:49962" {
		t.Fatalf("Expected argument to be '127.0.0.1:49962', got %s", line.Arguments[0].Value())
	}
}

func TestNoCommand(t *testing.T) {
	line := ParseLine("--long_arg test -t a", 0)

	if line.Command != nil {
		t.Fatalf("If line has no command, command should be nil, is instead focused on %+v", line.Command)
	}
}

func TestMixedArgs(t *testing.T) {
	line := ParseLine("toaster --long_arg 1 2 3 4 -t a -t abcd --noot", 0)

	c, err := line.GetArgs("long_arg")
	if err != nil {
		t.Fatalf("Did not expect to get an error here: %s", err)
	}

	if len(c) != 4 {
		t.Fatalf("long_args should have 4 args: has: %d args", len(c))
	}
	fmt.Println(line)

	if !line.IsSet("noot") {
		t.Fatalf("Expect to noot to be set")
	}

	c, err = line.GetArgs("t")
	if err != nil {
		t.Fatalf("Did not expect to get an error here: %s", err)
	}

	if len(c) != 2 {

		t.Fatalf("-t should have two arguments (concat) has %d", len(c))

	}

}

func TestHelperFunctionsErrors(t *testing.T) {
	line := ParseLine("lala --long_arg test -t a --zero -m", 0)

	_, err := line.GetArgString("long_arg")
	if err != nil {
		t.Fatalf("Getting single string arg on 'long_arg' should work: %s", err)
	}

	_, err = line.GetArgString("t")
	if err != nil {
		t.Fatalf("Getting single string arg on 't' should work: %s", err)
	}

	_, err = line.GetArgString("zero")
	if err == nil {
		t.Fatalf("Expected error, 'zero' has no arg, yet we are still nil")
	}

	_, err = line.GetArgString("m")
	if err == nil {
		t.Fatalf("Expected error, 'm' has no arg, yet we are still nil")
	}

	e, err := line.ExpectArgs("long_arg", 1)
	if err != nil {
		t.Fatalf("Long arg supplies correct number of expected args, should not error: %s", err)
	}

	if len(e) != 1 || e[0].Value() != "test" {
		t.Fatal("Output args was not correct from expect")
	}

	_, err = line.ExpectArgs("long_arg", 2)
	if err == nil {
		t.Fatal("long_args has < 2 arguments, should fail", err)
	}

	_, err = line.GetArg("bleep")
	if err != ErrFlagNotSet {
		t.Fatal("Error should be ErrFlagNotSet")
	}

}

func TestStrings(t *testing.T) {
	line := ParseLine("lala --long_arg \"test ''``-t a\" --zero -m", 0)

	_, err := line.GetArgString("long_arg")
	if err != nil {
		t.Fatalf("Getting single string arg on 'long_arg' should work: %s", err)
	}

	_, err = line.GetArgString("zero")
	if err == nil {
		t.Fatalf("Expected error, 'zero' has no arg, yet we are still nil")
	}

	_, err = line.GetArgString("m")
	if err == nil {
		t.Fatalf("Expected error, 'm' has no arg, yet we are still nil")
	}

	e, err := line.ExpectArgs("long_arg", 1)
	if err != nil {
		t.Fatalf("Long arg supplies correct number of expected args, should not error: %s", err)
	}

	if len(e) != 1 || e[0].Value() != "test ''``-t a" {
		t.Fatal("String was not handled correct as the value is incorrect")
	}

	if line.Chunks[0] != "lala" || line.Chunks[0] != line.Command.Value() {
		t.Fatal("First chunk should be command")
	}

	if line.Chunks[1] != "--long_arg" {
		t.Fatal("Next chunk should be flag")
	}

	if line.Chunks[2] != "test ''``-t a" {
		t.Fatal("Next chunk should be argument string")
	}
}
