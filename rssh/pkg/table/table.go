package table

import (
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
)

type value struct {
	parts   []string
	longest int
}

type Table struct {
	name          string
	cols          int
	line          [][]value
	cellMaxWidth  []int
	lineMaxHeight []int
}

func makeValue(rn string) (val value) {
	rn = strings.TrimSpace(rn)
	val.parts = strings.Split(rn, "\n")
	for _, n := range val.parts {
		if len(n) > val.longest {
			val.longest = len(n)
		}
	}
	return
}

func (t *Table) updateMax(line []value) error {
	if len(line) != t.cols {
		return errors.New("Number of values exceeds max number of columns")
	}

	if t.cellMaxWidth == nil {
		t.cellMaxWidth = make([]int, t.cols)
	}

	height := 0
	for i, n := range line {
		if t.cellMaxWidth[i] < n.longest {
			t.cellMaxWidth[i] = n.longest
		}

		if height < len(n.parts) {
			height = len(n.parts)
		}
	}

	t.lineMaxHeight = append(t.lineMaxHeight, height)

	return nil
}

func (t *Table) AddValues(vals ...string) error {
	if len(vals) != t.cols {
		return fmt.Errorf("Error more values exist than number of columns")
	}

	var line []value
	for _, v := range vals {
		line = append(line, makeValue(v))
	}

	err := t.updateMax(line)
	if err != nil {
		return err
	}

	t.line = append(t.line, line)

	return nil
}

func (t *Table) seperator() (out string) {
	out = "+"

	for i := 0; i < t.cols; i++ {
		// +2 to ensure there is room for the spaces either side of the value
		out += strings.Repeat("-", t.cellMaxWidth[i]+2) + "+"
	}

	return
}

func (t *Table) Print() {
	t.Fprint(os.Stdout)
}

func (t *Table) Fprint(w io.Writer) {

	for _, line := range t.OutputStrings() {
		fmt.Fprint(w, line+"\n")
	}
}

func (t *Table) FprintWidth(w io.Writer, width int) {

	lines := t.OutputStrings()

	for _, line := range lines {
		for i := 0; i < len(line) && i < width-1; i++ {
			fmt.Fprintf(w, "%c", line[i])
		}
		fmt.Fprint(w, "\n")
	}
}

func (t *Table) OutputStrings() (output []string) {

	seperator := t.seperator()

	for n, line := range t.line {
		// X Y
		values := make([][]string, len(line))
		for x, m := range line {
			values[x] = m.parts
		}

		for y := 0; y < t.lineMaxHeight[n]; y++ {

			m := "|"
			for x := 0; x < len(line); x++ {
				val := ""
				if len(values[x]) > y {
					val = values[x][y]
				}
				m += fmt.Sprintf(" %-"+fmt.Sprintf("%d", t.cellMaxWidth[x])+"s |", val)
			}

			output = append(output, m)

		}

		output = append(output, seperator)
	}

	output = append([]string{fmt.Sprintf("%"+fmt.Sprintf("%d", len(output[0])/2)+"s", t.name), seperator}, output...)

	return

}

func NewTable(name string, columnNames ...string) (t Table, err error) {

	var line []value
	for _, name := range columnNames {
		line = append(line, makeValue(name))
	}

	t.cols = len(line)

	t.name = name

	return t, t.AddValues(columnNames...)
}
