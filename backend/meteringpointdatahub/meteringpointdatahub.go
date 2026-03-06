package meteringpointdatahub

import (
	"context"
	"encoding/json"
	"errors"
	"flex/internal/validate"
	"fmt"
	"io"
	"net/http"
	"time"
)

// service is the implementation of the Metering Point Datahub service.
type service struct {
	url     string
	timeout time.Duration
}

// NewService is a convenience function to create a new service.
func NewService(url string) service { //nolint:revive
	return service{
		url:     url,
		timeout: 5 * time.Second,
	}
}

// FetchAccountingPointMeteringGridArea fetches the accounting point's metering grid area from the
// external Metering Point Datahub.
func (mpDatahubService *service) FetchAccountingPointMeteringGridArea(
	ctx context.Context,
	accountingPointBusinessID string,
) (string, error) {
	resp, err := mpDatahubService.requestMeteringPointData(ctx, accountingPointBusinessID)
	if err != nil {
		return "", fmt.Errorf("could not request data from datahub: %w", err)
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

func (mpDatahubService *service) requestMeteringPointData(ctx context.Context, id string) (*http.Response, error) {
	ctx, cancel := context.WithTimeout(ctx, mpDatahubService.timeout)
	defer cancel()

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		mpDatahubService.url+"/metering-points/"+id,
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("could not create request: %w", err)
	}

	resp, err := http.DefaultClient.Do(req) //nolint:gosec // URL is from configured datahub URL, not user input
	if err != nil {
		return nil, fmt.Errorf("connection to the metering point datahub failed: %w", err)
	}

	return resp, nil
}

var errUnexpectedStatusCode = errors.New("unexpected status code")
