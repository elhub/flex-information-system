package oidc

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"io"
)

// verifier is used to verify state and nonce between the request and the response.
// It uses HMAC hashing with SHA256 for verification.
type verifier struct {
	key  []byte
	msg  []byte
	hash []byte
}

// newVerifier creates a new verifier.
func newVerifier(key, msg []byte) (*verifier, error) {
	mac := hmac.New(sha256.New, key)

	_, err := mac.Write(msg)
	if err != nil {
		return nil, fmt.Errorf("could not hash input: %w", err)
	}

	return &verifier{key: key, msg: msg, hash: mac.Sum(nil)}, nil
}

// newRandomVerifier creates a new verifier.
func newRandomVerifier(key []byte) (*verifier, error) {
	entropy := 8

	msg := make([]byte, entropy)
	if _, err := io.ReadFull(rand.Reader, msg); err != nil {
		return nil, fmt.Errorf("could not read random data: %w", err)
	}

	return newVerifier(key, msg)
}

// newStringVerifier creates a new verifier from a string.
func newStrVerifier(key []byte, msgStr string) (*verifier, error) {
	msg, err := base64.RawURLEncoding.DecodeString(msgStr)
	if err != nil {
		return nil, fmt.Errorf("could not decode message: %w", err)
	}

	return newVerifier(key, msg)
}

// msgStr returns the message as a string.
func (v *verifier) msgStr() string {
	return base64.RawURLEncoding.EncodeToString(v.msg)
}

// hashStr returns the hash as a string.
func (v *verifier) hashStr() string {
	return base64.RawURLEncoding.EncodeToString(v.hash)
}

// verifyStr checks if the hashStr is equal to the verifier.
func (v *verifier) verifyStr(hashStr string) bool {
	hash, err := base64.RawURLEncoding.DecodeString(hashStr)
	if err != nil {
		return false
	}

	return hmac.Equal(v.hash, hash)
}
