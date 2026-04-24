//nolint:testpackage
package data

import (
	"net/url"
	"testing"
)

//nolint:funlen
func TestEmbedQueryRewrite(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		input      url.Values
		wantSelect string
		wantEmbed  string
		wantErr    bool
	}{
		{
			name:       "no embed param",
			input:      url.Values{"filter": {"foo"}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    false,
		},
		{
			name:       "empty embed param is a no-op",
			input:      url.Values{"embed": {""}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    false,
		},
		{
			name:       "select param is removed even without embed",
			input:      url.Values{"select": {"name"}, "filter": {"foo"}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    false,
		},
		{
			name:       "simple table embed without sub-relations",
			input:      url.Values{"embed": {"related_table"}},
			wantSelect: "*,related_table",
			wantEmbed:  "",
			wantErr:    false,
		},
		{
			name:       "single table with single sub-relation",
			input:      url.Values{"embed": {"order!(line_item)"}},
			wantSelect: "*,order!inner(*,line_item)",
			wantEmbed:  "",
			wantErr:    false,
		},
		{
			name:       "multiple top-level tables",
			input:      url.Values{"embed": {"table_a,table_b"}},
			wantSelect: "*,table_a,table_b",
			wantEmbed:  "",
			wantErr:    false,
		},
		{
			name:       "deeply nested sub-relations",
			input:      url.Values{"embed": {"a!(b!(c!(d)))"}},
			wantSelect: "*,a!inner(*,b!inner(*,c!inner(*,d)))",
			wantEmbed:  "",
			wantErr:    false,
		},
		{
			name:       "existing select is removed before setting new one",
			input:      url.Values{"select": {"name,id"}, "embed": {"table_a"}},
			wantSelect: "*,table_a",
			wantEmbed:  "",
			wantErr:    false,
		},
		{
			name:       "bare join hint without sub-relations",
			input:      url.Values{"embed": {"table!"}},
			wantSelect: "*,table!inner",
			wantEmbed:  "",
			wantErr:    false,
		},
		{
			name:       "sub-relations without join hint",
			input:      url.Values{"embed": {"table(sub)"}},
			wantSelect: "*,table(*,sub)",
			wantEmbed:  "",
			wantErr:    false,
		},
		{
			name:       "join hint and sub-relations combined with bare hint sibling",
			input:      url.Values{"embed": {"table_a!,table_b(sub)"}},
			wantSelect: "*,table_a!inner,table_b(*,sub)",
			wantEmbed:  "",
			wantErr:    false,
		},
		// Error cases
		{
			name:       "trailing identifier after join hint",
			input:      url.Values{"embed": {"table!sub"}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    true,
		},
		{
			name:       "unclosed parenthesis",
			input:      url.Values{"embed": {"table!(sub"}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    true,
		},
		{
			name:       "trailing comma in sub-relation list",
			input:      url.Values{"embed": {"table!(sub,)"}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    true,
		},
		{
			name:       "leading comma",
			input:      url.Values{"embed": {",table"}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    true,
		},
		{
			name:       "invalid character in identifier",
			input:      url.Values{"embed": {"table-name"}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    true,
		},
		{
			name:       "trailing garbage after expression",
			input:      url.Values{"embed": {"table!!("}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    true,
		},
		{
			name:       "invalid character at start of identifier",
			input:      url.Values{"embed": {"!(sub)"}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    true,
		},
		{
			name:       "extra closing paren",
			input:      url.Values{"embed": {"table!(sub))"}},
			wantSelect: "",
			wantEmbed:  "",
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			query := make(url.Values)
			for k, vs := range tt.input {
				query[k] = append([]string(nil), vs...)
			}

			err := embedQueryRewrite(query)

			if tt.wantErr {
				if err == nil {
					t.Errorf("embedQueryRewrite() expected error, got nil")
				}

				return
			}

			if err != nil {
				t.Errorf("embedQueryRewrite() unexpected error: %v", err)

				return
			}

			if got := query.Get("select"); got != tt.wantSelect {
				t.Errorf("embedQueryRewrite() select = %q, want %q", got, tt.wantSelect)
			}

			if got := query.Get("embed"); got != tt.wantEmbed {
				t.Errorf("embedQueryRewrite() embed = %q, want %q", got, tt.wantEmbed)
			}
		})
	}
}
