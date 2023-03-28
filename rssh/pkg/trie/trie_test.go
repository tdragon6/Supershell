package trie

import (
	"strings"
	"testing"
)

func TestSimpleAdd(t *testing.T) {
	nt := NewTrie()

	nt.Add("hello world is jordan")
	nt.Add("hello frank")
	nt.Add("Yeet Yeet Yeet")
	nt.Add("Yeet Yoot")
	nt.Add("Yapple")
	nt.Add("apple")

	s := nt.PrefixMatch("hel")

	if len(s) != 2 {
		t.Log("Number of matches for 'hel' != 2")
		t.FailNow()
	}

	found := false
	for _, m := range s {
		found = found || strings.Contains(m, "lo world is jordan")
	}

	if !found {
		t.Log("Did not find the completion required")
		t.FailNow()
	}
}

func TestSimpleRemove(t *testing.T) {
	nt := NewTrie()

	nt.Add("hello world is jordan")
	nt.Add("hello frank")
	nt.Add("Yeet Yeet Yeet")
	nt.Add("Yeet Yoot")
	nt.Add("Yapple")
	nt.Add("apple")

	nt.Remove("ap")

	if len(nt.getAll()) != 6 {
		t.Log("Removing of non-existant item caused length change")
		t.FailNow()
	}

	before := nt.getAll()

	nt.Remove("apple")

	after := nt.getAll()

	for _, n := range before {
		found := false
		for _, nn := range after {
			if nn == n {
				found = true
				break
			}
		}

		if !found && n != "apple" {
			t.Logf("Removed wrong item...? '%s'\n", n)
			t.FailNow()
		}

	}
}
