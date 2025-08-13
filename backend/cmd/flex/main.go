package main

import (
	"context"
	"flex"
	"fmt"
	"os"
)

func main() {
	ctx := context.Background()

	err := flex.Run(ctx, os.LookupEnv)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
