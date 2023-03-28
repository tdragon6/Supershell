package trie

import (
	"sync"
)

/**
This trie structure is only threadsafe if the root node is queried (due to golang not having and easy re-entrant lock for me to just use)
**/
type Trie struct {
	root     bool
	c        byte
	children map[byte]*Trie
	mut      sync.RWMutex
}

func (t *Trie) Add(s string) {
	if t.root {
		t.mut.Lock()
		defer t.mut.Unlock()
	}

	if len(s) == 0 {
		return
	}

	if child, ok := t.children[s[0]]; ok {
		child.Add(s[1:])
		return
	}

	newChild := &Trie{children: make(map[byte]*Trie)}
	newChild.c = s[0]
	t.children[s[0]] = newChild
	newChild.Add(s[1:])

}

func (t *Trie) getAll() (result []string) {
	if t.root {
		t.mut.RLock()
		defer t.mut.RUnlock()
	}

	if len(t.children) == 0 {
		return []string{string(t.c)}
	}

	prefix := string(t.c)
	if t.root {
		prefix = ""
	}
	for _, c := range t.children {
		for _, n := range c.getAll() {
			result = append(result, prefix+n)
		}
	}

	return result
}

func (t *Trie) PrefixMatch(prefix string) (result []string) {
	if t.root {
		t.mut.RLock()
		defer t.mut.RUnlock()
	}

	if len(prefix) == 0 {
		if len(t.children) == 0 {
			return []string{""}
		}

		for _, child := range t.children {
			result = append(result, child.getAll()...)
		}
		return result
	}

	if child, ok := t.children[prefix[0]]; ok {
		c := child.PrefixMatch(prefix[1:])
		for i := range c {
			c[i] = string(prefix[0]) + c[i]
		}
		return c
	}

	return []string{} // No matches

}

func (t *Trie) Remove(s string) bool {
	if t.root {
		t.mut.Lock()
		defer t.mut.Unlock()
	}

	if len(s) == 0 {
		return len(t.children) == 0
	}

	if len(t.children) == 0 {
		return true
	}

	if child, ok := t.children[s[0]]; ok && child.Remove(s[1:]) {
		delete(t.children, s[0])
		return len(t.children) == 0
	}

	return false
}

func NewTrie(values ...string) *Trie {
	t := &Trie{
		children: make(map[byte]*Trie),
		root:     true,
	}

	for _, v := range values {
		t.Add(v)
	}

	return t
}
