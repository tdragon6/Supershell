ifdef RSSH_HOMESERVER
	LDFLAGS += -X main.destination=$(RSSH_HOMESERVER)
endif

ifdef RSSH_FINGERPRINT
	LDFLAGS += -X main.fingerprint=$(RSSH_FINGERPRINT)
endif

ifdef IGNORE
	LDFLAGS += -X main.ignoreInput=$(IGNORE)
endif

ifndef CGO_ENABLED
	export CGO_ENABLED=0
endif


LDFLAGS += -X 'github.com/NHAS/reverse_ssh/internal.Version=$(shell git describe --tags)'

LDFLAGS_RELEASE = $(LDFLAGS) -s -w

debug: .generate_keys
	go build -ldflags="$(LDFLAGS)" -o bin ./...
	GOOS=windows GOARCH=amd64 go build -ldflags="$(LDFLAGS)" -o bin ./cmd/client

release: .generate_keys
	go build -ldflags="$(LDFLAGS_RELEASE)" -o bin ./...
	GOOS=windows GOARCH=amd64 go build -ldflags="$(LDFLAGS_RELEASE)" -o bin ./cmd/client

client: .generate_keys
	go build -ldflags=" $(LDFLAGS_RELEASE)" -o bin ./cmd/client

client_dll: .generate_keys
	test -n "$(RSSH_HOMESERVER)" # Shared objects cannot take arguments, so must have a callback server baked in (define RSSH_HOMESERVER)
	CGO_ENABLED=1 go build -tags=cshared -buildmode=c-shared -ldflags="$(LDFLAGS_RELEASE)" -o bin/client.dll ./cmd/client

server:
	mkdir -p bin
	go build -ldflags="-s -w" -o bin ./cmd/server

.generate_keys:
	mkdir -p bin
# Supress errors if user doesn't overwrite existing key
	ssh-keygen -t ed25519 -N '' -C '' -f internal/client/keys/private_key || true
# Avoid duplicate entries
	touch bin/authorized_controllee_keys
	@grep -q "$$(cat internal/client/keys/private_key.pub)" bin/authorized_controllee_keys || cat internal/client/keys/private_key.pub >> bin/authorized_controllee_keys
