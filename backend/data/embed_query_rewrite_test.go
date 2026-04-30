//nolint:testpackage
package data

import (
	"net/url"
	"reflect"
	"sort"
	"testing"
)

//nolint:funlen
func TestParseEmbed(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		input   url.Values
		want    []embedNode
		wantErr bool
	}{
		{
			name:    "no embed parameter",
			input:   url.Values{"filter": {"foo"}},
			want:    []embedNode{},
			wantErr: false,
		},
		{
			name:    "empty embed parameter",
			input:   url.Values{"embed": {""}},
			want:    []embedNode{},
			wantErr: false,
		},
		{
			name:    "single resource embed without sub-relations",
			input:   url.Values{"embed": {"a"}},
			want:    []embedNode{{name: "a"}}, //nolint:exhaustruct
			wantErr: false,
		},
		{
			name:  "single resource embed with single sub-relation and join hint",
			input: url.Values{"embed": {"a!(b)"}},
			want: []embedNode{{
				name: "a", joinHint: true, children: []embedNode{
					{name: "b"}, //nolint:exhaustruct
				},
			}},
			wantErr: false,
		},
		{
			name:    "multiple top-level resources",
			input:   url.Values{"embed": {"a,b"}},
			want:    []embedNode{{name: "a"}, {name: "b"}}, //nolint:exhaustruct
			wantErr: false,
		},
		{
			name:  "deeply nested sub-relations",
			input: url.Values{"embed": {"a!(b!(c!(d)))"}},
			want: []embedNode{{
				name: "a", joinHint: true, children: []embedNode{{
					name: "b", joinHint: true, children: []embedNode{{
						name: "c", joinHint: true, children: []embedNode{
							{name: "d"}, //nolint:exhaustruct
						},
					}},
				}},
			}},
			wantErr: false,
		},
		{
			name:    "bare join hint without sub-relations",
			input:   url.Values{"embed": {"a!"}},
			want:    []embedNode{{name: "a", joinHint: true}}, //nolint:exhaustruct
			wantErr: false,
		},
		{
			name:  "sub-relations without join hint",
			input: url.Values{"embed": {"a(b)"}},
			want: []embedNode{{ //nolint:exhaustruct
				name: "a", children: []embedNode{
					{name: "b"}, //nolint:exhaustruct
				},
			}},
			wantErr: false,
		},
		{
			name:  "combined",
			input: url.Values{"embed": {"a!,b(c)"}},
			want: []embedNode{
				{name: "a", joinHint: true},                     //nolint:exhaustruct
				{name: "b", children: []embedNode{{name: "c"}}}, //nolint:exhaustruct
			},
			wantErr: false,
		},
		// error cases
		{ //nolint:exhaustruct
			name:    "trailing identifier after join hint",
			input:   url.Values{"embed": {"a!b"}},
			wantErr: true,
		},
		{ //nolint:exhaustruct
			name:    "unclosed parenthesis",
			input:   url.Values{"embed": {"a!(b"}},
			wantErr: true,
		},
		{ //nolint:exhaustruct
			name:    "trailing comma in sub-relation list",
			input:   url.Values{"embed": {"a!(b,)"}},
			wantErr: true,
		},
		{ //nolint:exhaustruct
			name:    "leading comma",
			input:   url.Values{"embed": {",a"}},
			wantErr: true,
		},
		{ //nolint:exhaustruct
			name:    "invalid character in identifier",
			input:   url.Values{"embed": {"a-a"}},
			wantErr: true,
		},
		{ //nolint:exhaustruct
			name:    "trailing garbage after expression",
			input:   url.Values{"embed": {"a!!("}},
			wantErr: true,
		},
		{ //nolint:exhaustruct
			name:    "invalid character at start of identifier",
			input:   url.Values{"embed": {"!(a)"}},
			wantErr: true,
		},
		{ //nolint:exhaustruct
			name:    "extra closing parenthesis",
			input:   url.Values{"embed": {"a!(b))"}},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := parseEmbed(tt.input)

			if tt.wantErr {
				if err == nil {
					t.Errorf("parseEmbed() expected error, got nil")
				}

				return
			}

			if err != nil {
				t.Errorf("parseEmbed() unexpected error: %v", err)

				return
			}

			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseEmbed() = %+v, want %+v", got, tt.want)
			}
		})
	}
}

//nolint:funlen
func TestApplyEmbedRewrite(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		input      url.Values
		wantSelect string
		wantEmbed  string
	}{
		{
			name:       "empty nodes does not set select",
			input:      url.Values{"filter": {"foo"}},
			wantSelect: "",
			wantEmbed:  "",
		},
		{
			name:       "existing select is removed even with nil nodes",
			input:      url.Values{"select": {"name"}, "filter": {"foo"}},
			wantSelect: "",
			wantEmbed:  "",
		},
		{
			name:       "simple table embed",
			input:      url.Values{"embed": {"related_table"}},
			wantSelect: "*,related_table",
			wantEmbed:  "",
		},
		{
			name:       "single table with join hint and sub-relation",
			input:      url.Values{"embed": {"order!(line_item)"}},
			wantSelect: "*,order!inner(*,line_item)",
			wantEmbed:  "",
		},
		{
			name:       "multiple top-level tables",
			input:      url.Values{"embed": {"table_a,table_b"}},
			wantSelect: "*,table_a,table_b",
			wantEmbed:  "",
		},
		{
			name:       "deeply nested sub-relations",
			input:      url.Values{"embed": {"a!(b!(c!(d)))"}},
			wantSelect: "*,a!inner(*,b!inner(*,c!inner(*,d)))",
			wantEmbed:  "",
		},
		{
			name:       "existing select is replaced",
			input:      url.Values{"select": {"name,id"}, "embed": {"table_a"}},
			wantSelect: "*,table_a",
			wantEmbed:  "",
		},
		{
			name:       "bare join hint without sub-relations",
			input:      url.Values{"embed": {"table!"}},
			wantSelect: "*,table!inner",
			wantEmbed:  "",
		},
		{
			name:       "sub-relations without join hint",
			input:      url.Values{"embed": {"table(sub)"}},
			wantSelect: "*,table(*,sub)",
			wantEmbed:  "",
		},
		{
			name:       "join hint and sub-relations combined with bare hint sibling",
			input:      url.Values{"embed": {"table_a!,table_b(sub)"}},
			wantSelect: "*,table_a!inner,table_b(*,sub)",
			wantEmbed:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			query := make(url.Values)
			for k, vs := range tt.input {
				query[k] = append([]string(nil), vs...)
			}

			nodes, err := parseEmbed(query)
			if err != nil {
				t.Fatalf("parseEmbed() unexpected error: %v", err)
			}

			applyEmbedRewrite(query, nodes)

			if got := query.Get("select"); got != tt.wantSelect {
				t.Errorf("applyEmbedRewrite() select = %q, want %q", got, tt.wantSelect)
			}

			if got := query.Get("embed"); got != tt.wantEmbed {
				t.Errorf("applyEmbedRewrite() embed = %q, want %q", got, tt.wantEmbed)
			}
		})
	}
}

//nolint:funlen
func TestResourceNames(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		nodes []embedNode
		want  []string
	}{
		{
			name:  "empty list",
			nodes: nil,
			want:  []string{},
		},
		{
			name: "single node",
			nodes: []embedNode{
				{name: "accounting_point"}, //nolint:exhaustruct
			},
			want: []string{"accounting_point"},
		},
		{
			name: "multiple top-level nodes",
			nodes: []embedNode{
				{name: "accounting_point"},   //nolint:exhaustruct
				{name: "technical_resource"}, //nolint:exhaustruct
			},
			want: []string{"accounting_point", "technical_resource"},
		},
		{
			name: "nested nodes",
			nodes: []embedNode{
				{name: "controllable_unit", children: []embedNode{ //nolint:exhaustruct
					{name: "accounting_point", children: []embedNode{ //nolint:exhaustruct
						{name: "metering_grid_area"}, //nolint:exhaustruct
					}},
					{name: "technical_resource"}, //nolint:exhaustruct
				}},
			},
			want: []string{"accounting_point", "controllable_unit", "metering_grid_area", "technical_resource"},
		},
		{
			name: "duplicates are deduplicated",
			nodes: []embedNode{
				{name: "foo", children: []embedNode{ //nolint:exhaustruct
					{name: "bar"}, //nolint:exhaustruct
				}},
				{name: "bar"}, //nolint:exhaustruct
			},
			want: []string{"bar", "foo"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := resourceNames(tt.nodes)
			sort.Strings(got)
			sort.Strings(tt.want)

			if len(got) != len(tt.want) {
				t.Errorf("resourceNames() = %v, want %v", got, tt.want)

				return
			}

			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("resourceNames() = %v, want %v", got, tt.want)

					return
				}
			}
		})
	}
}
