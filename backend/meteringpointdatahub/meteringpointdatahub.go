package meteringpointdatahub

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
)

// Service defines the data fetching operations we can execute thanks to an external Metering Point
// Datahub.
type Service interface {
	FetchAccountingPointData(
		ctx context.Context, accountingPointBusinessID string,
	) (*AccountingPointData, error)
}

// UnimplementedService is a service that always fails. This is used to switch the feature off on
// environments that do not need it.
type UnimplementedService struct{}

var _ Service = &UnimplementedService{}

// FetchAccountingPointData returns an error indicating that the service is not implemented.
func (*UnimplementedService) FetchAccountingPointData(context.Context, string) (
	*AccountingPointData, error,
) {
	return nil, errNotImplemented
}

// defaultService is the default implementation for the Service interface.
type defaultService struct {
	url string
}

var _ Service = &defaultService{} //nolint:exhaustruct

// NewService is a convenience function to create a new defaultService.
func NewService(url string) defaultService { //nolint:revive
	return defaultService{url: url}
}

// FetchAccountingPointData fetches the accounting point data from the external Metering Point Datahub.
func (mpDatahubService *defaultService) FetchAccountingPointData(
	ctx context.Context,
	accountingPointBusinessID string,
) (*AccountingPointData, error) {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		mpDatahubService.url+"/metering-points/"+accountingPointBusinessID,
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("could not create request: %w", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("connection to the metering point datahub failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("%w: %d", errUnexpectedStatusCode, resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("could not read response body: %w", err)
	}

	return unmarshalAccountingPointData(body, accountingPointBusinessID)
}

var (
	errNotImplemented       = errors.New("not implemented")
	errUnexpectedStatusCode = errors.New("unexpected status code")
)
