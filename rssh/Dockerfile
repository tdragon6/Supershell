FROM golang:1.19-bullseye

WORKDIR /app

RUN sed -i s@/archive.ubuntu.com/@/mirrors.aliyun.com/@g /etc/apt/sources.list && \
    go env -w GOPROXY=https://mirrors.aliyun.com/goproxy/,direct && \
    apt -y --no-install-recommends update && \
    apt -y --no-install-recommends upgrade && \
    apt install -y --no-install-recommends upx-ucl gcc-mingw-w64 && \
    rm -rf /var/cache/apk/* && \
    go install mvdan.cc/garble@f9d9919

ENV PATH="${PATH}:$(go env GOPATH)/bin"

COPY go.mod go.sum ./

RUN go mod download -x

COPY . .

RUN make server

RUN chmod +x /app/docker-entrypoint.sh /app/wait-for-it.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
