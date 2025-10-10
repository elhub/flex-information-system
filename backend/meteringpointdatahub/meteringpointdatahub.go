package meteringpointdatahub

import (
	"context"
	"encoding/json"
	"errors"
	"flex/internal/validate"
	"fmt"
	"io"
	"net/http"
)

// UnimplementedService is a service that always fails. This is used to switch the feature off on
// environments that do not need it.
type UnimplementedService struct{}

// FetchAccountingPointMeteringGridArea returns an error indicating that the service is not
// implemented.
func (*UnimplementedService) FetchAccountingPointMeteringGridArea(
	context.Context, string,
) (string, error) {
	return "", errNotImplemented
}

// defaultService is the default implementation for a metering point datahub service.
type defaultService struct {
	url string
}

// NewService is a convenience function to create a new defaultService.
func NewService(url string) defaultService { //nolint:revive
	return defaultService{url: url}
}

// FetchAccountingPointMeteringGridArea fetches the accounting point's metering grid area from the
// external Metering Point Datahub.
func (mpDatahubService *defaultService) FetchAccountingPointMeteringGridArea(
	ctx context.Context,
	accountingPointBusinessID string,
) (string, error) {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		mpDatahubService.url+"/metering-points/"+accountingPointBusinessID,
		nil,
	)
	if err != nil {
		return "", fmt.Errorf("could not create request: %w", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("connection to the metering point datahub failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("%w: %d", errUnexpectedStatusCode, resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("could not read response body: %w", err)
	}

	var mpdRaw meteringPointDataRaw
	err = json.Unmarshal(body, &mpdRaw)
	if err != nil {
		return "", fmt.Errorf("could not parse response body: %w", err)
	}

	responseValidator := validate.New()
	responseValidator.Check(
		len(mpdRaw.Data) == 1,
		"expected exactly one metering point data entry, got %d", len(mpdRaw.Data),
	)
	responseValidator.Check(
		mpdRaw.Data[0].Attributes.Status == "Active",
		"metering point is inactive",
	)
	err = responseValidator.Error()
	if err != nil {
		return "", err
	}

	return mpdRaw.Data[0].Relationships.GridArea.Data.ID, nil
}

var (
	errNotImplemented       = errors.New("not implemented")
	errUnexpectedStatusCode = errors.New("unexpected status code")
)
