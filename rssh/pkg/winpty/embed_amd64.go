//go:build windows
// +build windows

package winpty

import (
	"embed"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

//go:embed x64/*
var binaries embed.FS

func writeBinaries() error {

	vsn := windows.RtlGetVersion()

	/*
		https://msdn.microsoft.com/en-us/library/ms724832(VS.85).aspx
		Windows 10					10.0*
		Windows Server 2016			10.0*
		Windows 8.1					6.3*
		Windows Server 2012 R2		6.3*
		Windows 8					6.2
		Windows Server 2012			6.2
		Windows 7					6.1
		Windows Server 2008 R2		6.1
		Windows Server 2008			6.0
		Windows Vista				6.0
		Windows Server 2003 R2		5.2
		Windows Server 2003			5.2
		Windows XP 64-Bit Edition	5.2
		Windows XP					5.1
		Windows 2000				5.0
	*/

	dllType := "regular"
	if vsn.MajorVersion == 5 {
		dllType = "xp"
	}

	if _, err := os.Stat(winptyDllName); errors.Is(err, os.ErrNotExist) {
		dll, err := binaries.ReadFile(path.Join("x64", dllType, winptyDllName))
		if err != nil {
			panic(err)
		}
		err = ioutil.WriteFile(winptyDllName, dll, 0700)
		if err != nil {
			return err
		}
	}

	if _, err := os.Stat(winptyAgentName); errors.Is(err, os.ErrNotExist) {
		dll, err := binaries.ReadFile(path.Join("x64", dllType, winptyAgentName))
		if err != nil {
			panic(err)
		}
		err = ioutil.WriteFile(winptyAgentName, dll, 0700)
		if err != nil {
			return err
		}
	}

	return nil
}

func createAgentCfg(flags uint32) (uintptr, error) {
	var errorPtr uintptr

	err := winpty_error_free.Find() // check if dll available
	if err != nil {
		return uintptr(0), err
	}

	defer winpty_error_free.Call(errorPtr)

	agentCfg, _, _ := winpty_config_new.Call(uintptr(flags), uintptr(unsafe.Pointer(errorPtr)))
	if agentCfg == uintptr(0) {
		return 0, fmt.Errorf("Unable to create agent config, %s", GetErrorMessage(errorPtr))
	}

	return agentCfg, nil
}

func createSpawnCfg(flags uint32, appname, cmdline, cwd string, env []string) (uintptr, error) {
	var errorPtr uintptr
	defer winpty_error_free.Call(errorPtr)

	cmdLineStr, err := syscall.UTF16PtrFromString(cmdline)
	if err != nil {
		return 0, fmt.Errorf("Failed to convert cmd to pointer.")
	}

	appNameStr, err := syscall.UTF16PtrFromString(appname)
	if err != nil {
		return 0, fmt.Errorf("Failed to convert app name to pointer.")
	}

	cwdStr, err := syscall.UTF16PtrFromString(cwd)
	if err != nil {
		return 0, fmt.Errorf("Failed to convert working directory to pointer.")
	}

	envStr, err := UTF16PtrFromStringArray(env)

	if err != nil {
		return 0, fmt.Errorf("Failed to convert cmd to pointer.")
	}

	spawnCfg, _, _ := winpty_spawn_config_new.Call(
		uintptr(flags),
		uintptr(unsafe.Pointer(appNameStr)),
		uintptr(unsafe.Pointer(cmdLineStr)),
		uintptr(unsafe.Pointer(cwdStr)),
		uintptr(unsafe.Pointer(envStr)),
		uintptr(unsafe.Pointer(errorPtr)),
	)

	if spawnCfg == uintptr(0) {
		return 0, fmt.Errorf("Unable to create spawn config, %s", GetErrorMessage(errorPtr))
	}

	return spawnCfg, nil
}
