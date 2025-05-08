LIQUIBASE_VERSION := "4.31.1"

lint: pre-commit tbls-lint

pre-commit:
    pre-commit run --all-files

tbls-lint:
    tbls lint

start:
    #!/usr/bin/env bash
    set -euo pipefail
    docker compose up -d

    # wait for startup
    until psql -h localhost -d flex -U postgres -c "select 1" &> /dev/null;
    do
        sleep 0.1;
    done

# remove data from the database
unload:
    #!/usr/bin/env bash
    set -euo pipefail
    export PGHOST=localhost
    ./db/unload.sh


# load the database
load: liquibase
    #!/usr/bin/env bash
    set -euo pipefail
    export PGHOST=localhost

    psql -X -v ON_ERROR_STOP=1 -d postgres -U postgres \
        -c "ALTER USER flex_authenticator PASSWORD 'authenticator_password';"
    psql -X -v ON_ERROR_STOP=1 -d postgres -U postgres \
        -c "ALTER USER flex_replication PASSWORD 'replication_password';"

    UUID_TEST='3733e21b-5def-400d-8133-06bcda02465e'
    UUID_COMMON='df8bee5f-6e60-4a21-8927-e5bcdd4ce768'

    for entity in test common;
    do
        PUBKEY=$(cat "./test/keys/.${entity}.pub.pem")
        UUID_VAR_NAME="UUID_${entity^^}"
        UUID=${!UUID_VAR_NAME}
        psql -X -v ON_ERROR_STOP=1 -d flex -U postgres \
            -c "BEGIN" \
            -c "SELECT set_config('flex.current_identity', '0', true);" \
            -c "UPDATE flex.entity_client SET client_id = '${UUID}', public_key = '${PUBKEY}', client_secret='87h87hijhulO', recorded_by = 0 WHERE id = (SELECT e.id FROM flex.entity AS e WHERE name ilike '${entity}%' AND NOT name ilike '%AS');" \
            -c "COMMIT"
    done

    docker compose kill -s SIGUSR1 postgrest
    docker compose restart backend

    echo Loaded!
    echo Hit this url to log in:
    echo ' - TEST : https://test.flex.internal:6443/'

# reload the database
reload: unload load

stop:
    docker compose stop || true
    docker compose rm -f

pull:
    docker compose pull

down:
    docker compose down || true

# stop (remove) and start the local database
reset: down pull build start load

# start backend in dev mode
backend:
    #!/usr/bin/env bash
    set -euo pipefail
    docker compose stop backend || true
    set -a; source ./local/backend/dev.env; set +a
    cd backend
    air

# start frontend in dev mode
frontend:
    #!/usr/bin/env bash
    set -euo pipefail
    cd frontend
    npm run dev

# connect to local database (no password required)
connect user="postgres":
    pgcli -h localhost -p 5432 -d flex -u {{ user }}

# initialize local development environment
init: && _venv _java_install _plantuml_install _liquibase_install _keypair
    rm -rf .venv .bin
    pre-commit install

_java_install:
    #!/usr/bin/env bash
    set -euo pipefail

    mkdir -p .bin/java
    cd .bin

    # java
    curl -L https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.14+7/OpenJDK17U-jre_x64_linux_hotspot_17.0.14_7.tar.gz | \
    tar --strip-components=1 --gzip --extract --directory=java

_liquibase_install:
    #!/usr/bin/env bash
    set -euo pipefail
    # if .bin/liquibase does not exist, download it
    if [ ! -f .bin/liquibase-{{ LIQUIBASE_VERSION }}/liquibase ]
    then
        mkdir -p \
            .bin/liquibase-{{ LIQUIBASE_VERSION }} \
            local/.bin

        wget -c https://github.com/liquibase/liquibase/releases/download/v{{ LIQUIBASE_VERSION }}/liquibase-{{ LIQUIBASE_VERSION }}.tar.gz  -O - |
            tar -xz -C .bin/liquibase-{{ LIQUIBASE_VERSION }}

        ln -s liquibase-{{ LIQUIBASE_VERSION }}/liquibase .bin/liquibase
    else
        echo "Liquibase {{ LIQUIBASE_VERSION }} already installed at .bin/liquibase-{{ LIQUIBASE_VERSION }}/liquibase"
    fi

_plantuml_install:
    #!/usr/bin/env bash
    set -euo pipefail

    cd .bin

    PLANTUML_VERSION='1.2024.7'
    PLANTUML_JAR="plantuml-${PLANTUML_VERSION}.jar"
    if [ ! -d "${PLANTUML_JAR}" ]; then
        curl -L "https://github.com/plantuml/plantuml/releases/download/v${PLANTUML_VERSION}/${PLANTUML_JAR}" -o "${PLANTUML_JAR}"
    fi

    ln -sf "${PLANTUML_JAR}" plantuml.jar

_venv:
    #!/usr/bin/env bash
    set -euo pipefail

    if [ ! -d '.venv' ]; then
        python3.12 -m venv .venv --prompt flex
        .venv/bin/pip3 install --upgrade pip
        .venv/bin/pip3 install -r requirements-dev.txt
    fi

# Generate a RSA keypair used in test
_keypair:
    ./local/scripts/generate_keypair.sh ./test/keys/ test
    ./local/scripts/generate_keypair.sh ./test/keys/ common

test-local *args: (_venv)
    #!/usr/bin/env bash
    set -euo pipefail
    export FLEX_URL_BASE="https://test.flex.internal:6443"
    export FLEX_AUTH_BASE="${FLEX_URL_BASE}"
    .venv/bin/python test/test.py {{args}}

test-dev *args:
    #!/usr/bin/env bash
    set -euo pipefail
    export FLEX_URL_BASE="https://test.flex.internal:6443"
    export FLEX_AUTH_BASE="http://test.flex.internal:7001"
    .venv/bin/python test/test.py {{args}}

test *args:
    @just test-local {{args}}

# directly use pytest
# e.g. just pytest test/api_client_tests/test_cu.py
pytest *args: (_venv)
    #!/usr/bin/env bash
    set -euo pipefail
    export FLEX_URL_BASE="https://test.flex.internal:6443"
    export FLEX_AUTH_BASE="${FLEX_URL_BASE}"

    .venv/bin/python \
    -m pytest \
    -v test/security_token_service.py \
    {{args}}

megalinter:
    npx mega-linter-runner

coverage:
    .venv/bin/python test/check_coverage.py

# build docs and frontend for local
build:
    #!/usr/bin/env bash
    set -euxo pipefail

    ./local/scripts/build-static.sh local

    rm -rf local/nginx/.html/*
    mkdir -p local/nginx/.html
    tar -xzf ./dist/dist.tar.gz -C ./local/nginx/.html/

liquibase pghost='localhost' password='flex_password' action='update' changelog='db/changelog.yml':
    #!/usr/bin/env bash
    set -euo pipefail
    JAVA_HOME=.bin/java \
    LIQUIBASE_COMMAND_URL=jdbc:postgresql://{{ pghost }}:5432/flex \
    LIQUIBASE_COMMAND_USERNAME=flex \
    LIQUIBASE_COMMAND_PASSWORD={{ password }} \
    .bin/liquibase-{{ LIQUIBASE_VERSION }}/liquibase \
    --contexts=local \
    --liquibaseSchemaName=flex \
    --defaultSchemaName=flex \
    --changeLogFile={{ changelog }} \
    --log-level=warning \
    {{ action }}

# generate documentation using mkdocs
mkdocs: _venv _mkdocs
_mkdocs:
    .venv/bin/mkdocs serve

diagrams: tbls plantuml

tbls:
    #!/usr/bin/env bash
    set -euxo pipefail
    # silence WARN[0000]log.go:228 gosnowflake.(*defaultLogger).Warn DBUS_SESSION_BUS_ADDRESS envvar looks to be not set
    export DBUS_SESSION_BUS_ADDRESS=/dev/null

    echo "@startdot tables" > docs-dev/diagrams/tables.plantuml
    tbls out --format dot >> docs-dev/diagrams/tables.plantuml
    echo "@enddot" >> docs-dev/diagrams/tables.plantuml


plantuml pattern='*':
    #!/usr/bin/env bash
    set -euo pipefail
    for file in $(find ./docs*/ -name '*{{ pattern }}*.plantuml');
    do
        echo "PlantUML: $file"

        .bin/java/bin/java -Djava.net.useSystemProxies=true -jar .bin/plantuml.jar -tpng $file

    done

# vendor swagger 2 and openapi 3 specs
openapi-postgrest:
    #!/usr/bin/env bash
    set -euxo pipefail
    curl --silent http://localhost:3000/ | jq -M > openapi/postgrest-swagger-2.0.json

    mkdir -p out

    # Convert PostgREST Swagger 2.0 to OpenAPI 3.0
    # https://github.com/OpenAPITools/openapi-generator
    docker run \
        --rm \
        -v "${PWD}/openapi:/openapi" \
        -v "${PWD}/out:/out" \
        -u $(id -u ${USER}):$(id -g ${USER}) \
    openapitools/openapi-generator-cli generate \
        -i /openapi/postgrest-swagger-2.0.json \
        -g openapi \
        -o /out/

    cat out/openapi.json | jq -M > openapi/postgrest-openapi-3.0.json

    rm -rf out/*

openapi: resources-to-diagram template-to-openapi openapi-to-md openapi-to-db sqlc openapi-client openapi-to-tooltips

template-to-openapi:
    #!/usr/bin/env bash
    set -euo pipefail

    .venv/bin/python3 local/scripts/template_to_openapi.py \
    --base-file openapi/openapi-api-base.yml \
    --servers-file openapi/servers.yml \
    --resources-file openapi/resources.yml > openapi/openapi-api.json

    # remove custom fields from the final OpenAPI specification
    jq '( .components.schemas // empty )
            |= walk(
                if type == "object" then
                with_entries(select(.key | startswith("x-") | not))
                else . end
            )' \
        --indent 4 \
        < openapi/openapi-api.json \
        > openapi/openapi-api-clean.json
    mv openapi/openapi-api-clean.json openapi/openapi-api.json

    yq -o=json --indent 4 openapi/openapi-auth.yml > openapi/openapi-auth.json

    spectral lint \
        --fail-severity warn \
        --verbose \
        openapi/openapi-api.json

    spectral lint \
        --fail-severity warn \
        --verbose \
        openapi/openapi-auth.json

resources-to-diagram:
    #!/usr/bin/env bash
    set -euo pipefail
    yq eval-all '. as $item ireduce ({}; . *d $item )' openapi/resources.yml openapi/resources-future.yml | \
    .venv/bin/python3 local/scripts/resources_to_diagram.py | tee docs/diagrams/resources.plantuml

openapi-to-db:
    #!/usr/bin/env bash
    set -euo pipefail
    cat openapi/resources.yml | .venv/bin/python3 local/scripts/openapi_to_db.py

    .venv/bin/python3 local/scripts/internal_resources_to_db.py

    imports=$(ls db/flex | grep history_audit.sql | sed -e 's|.*|\\i flex/&|')

    ed -s "./db/flex_structure.sql" <<EOF
    /-- history and audit/+,/-- security/-d
    /-- history and audit/a

    ${imports}

    .
    wq
    EOF

    imports=$(ls db/authz | sed -e 's|.*|\\i authz/&|')

    ed -s "./db/flex_structure.sql" <<EOF
    /-- security/+,/-- RLS/-d
    /-- security/a

    ${imports}

    .
    wq
    EOF

    imports=$(ls db/api/ | grep sql | sed -e 's|.*|\\i api/&|')

    ed -s "./db/api_structure.sql" <<EOF
    /-- views/+,/-- triggers/-d
    /-- views/a

    ${imports}

    .
    wq
    EOF

sqlc:
    #!/usr/bin/env bash
    set -euo pipefail
    cd backend
    for module in data event; do
        cp sqlc.yaml $module
        cat schema.sql $module/schema.sql 2>/dev/null > $module/tmp_schema.sql || true
        cd $module
        sqlc generate
        rm sqlc.yaml tmp_schema.sql
        cd ..
    done

generate:
    #!/usr/bin/env bash
    set -euo pipefail
    cd backend
    go generate ./...

openapi-to-md:
    #!/usr/bin/env bash
    set -euo pipefail
    # https://superuser.com/a/1835488

    echo "Generating markdown tables"

    for resource in $(find docs/resources/ -type f -not -name "index.md" -exec basename {} \; | cut -d. -f1); do
        echo ".. ${resource}"

        table=$(cat openapi/resources.yml | .venv/bin/python3 local/scripts/openapi_to_markdown.py ${resource} )

        api_link="/api/v0/#/operations/list_$resource"
        docx_link="/docs/download/${resource}.docx"

        ed -s "./docs/resources/${resource}.md" <<EOF
    /## Relevant links/+,/## Fields/-d
    /## Relevant links/a

    * [API Documentation](${api_link})
    * [Download docx](${docx_link})

    .
    wq
    EOF

        ed -s "./docs/resources/${resource}.md" <<EOF
    /## Fields/+,/## Validation Rules/-d
    /## Fields/a

    ${table}

    .
    wq
    EOF

    done

openapi-client:
    #!/usr/bin/env bash
    set -euo pipefail
    mkdir -p ./out
    rm -rf test/flex ./out/openapi-client

    # We are removing default values from the OpenAPI spec since openapi-python-client
    # assumes that the client should use the default value if it is not provided.
    # Our interpretation of the default value is that it is a value that the
    # _server_ uses if the client does not provide a value.

    jq '( .components.schemas // empty, .paths[].get.parameters // empty )
            |= walk(if type == "object" then del(.default) else . end)' \
        --indent 4 \
        < openapi/openapi-api.json \
        > openapi/openapi-api-no-default.json

    ./.venv/bin/openapi-python-client generate \
        --path ./openapi/openapi-api-no-default.json \
        --output-path ./out/openapi-client \
        --config ./openapi/openapi-client-config.yml
    mv ./out/openapi-client/flex test/flex

openapi-to-tooltips:
    #!/usr/bin/env bash
    cat openapi/resources.yml \
        | yq '.resources[] as $res ireduce ({};
            .[$res.id] = ($res.properties | map_values (.description)))' \
            > tmp.yml
    cat openapi/openapi-api-base.yml \
        | yq '.components.schemas | to_entries[] as $sch ireduce({};
            .[$sch.key] = ($sch.value.properties | map_values (.description)))' \
            >> tmp.yml
    cat tmp.yml | yq -o json --indent 4 > frontend/src/tooltip/tooltips.json
    rm tmp.yml

permissions: permissions-to-frontend permissions-to-md permissions-to-db

permissions-to-db:
    echo "-- liquibase formatted sql\n-- AUTO-GENERATED FILE (just permissions-to-db)\n" \
        | tee db/api/grants/field_level_authorization.sql > db/flex/grants/field_level_authorization.sql

    cat local/input/permissions.csv \
        | .venv/bin/python3 local/scripts/permissions_to_grant.py \
        >> db/api/grants/field_level_authorization.sql \
        2>> db/flex/grants/field_level_authorization.sql

permissions-to-md:
    #!/usr/bin/env bash
    set -euo pipefail
    # https://superuser.com/a/1835488

    echo "Generating markdown tables"

    for resource in $(find docs/resources/ -type f -not -name "index.md" -exec basename {} \; | cut -d. -f1); do
        echo ".. ${resource}"

        sed -i '/^For party type abbreviations/,$d' docs/resources/${resource}.md

        echo "For party type abbreviations, check [the auth docs](../auth.md#party)" >> docs/resources/${resource}.md
        echo "" >> docs/resources/${resource}.md

        grep -E "^((${resource})|(RESOURCE))\;" local/input/permissions.csv \
            | cut -d ';' -f 2-11 \
            | .venv/bin/python3 ./local/scripts/csv_to_md.py >> docs/resources/${resource}.md

    done


permissions-to-frontend:
    cat local/input/permissions.csv \
        | .venv/bin/python3 ./local/scripts/permissions_to_json.py \
        | jq --indent 4 \
        > frontend/src/auth/permissions.json

avatar:
    #!/usr/bin/env bash
    set -euo pipefail
    mkdir -p frontend/src/auth/avatars
    for code in ANO BRP ES EU ENT FISO MO SP SO TP;
    do
        echo Getting avatar for $code
        curl "https://ui-avatars.com/api/?background=D6E4D5&color=0B3C28&rounded=true&bold=true&length=4&size=128&font-size=0.4&name=$code" \
        --silent \
        -o frontend/src/auth/avatars/$code.png
    done

vet-license:
    #!/usr/bin/env bash
    set -euo pipefail

    # This just suppresses some annoyting NODE warnings
    export NODE_OPTIONS='--no-warnings'

    # license-checker will exit with 1 if there are any non-allowed licenses
    echo 'Checking Node/frontend licenses'

    npx license-checker --production --start ./frontend/ \
        --onlyAllow 'MIT;0BSD;BSD*;BSD-3-Clause;BSD-2-Clause;ISC;Apache-2.0' 1>/dev/null

    echo 'Checking Go/backend licenses'
    cd backend
    # Forbidden licenses: https://github.com/google/licenseclassifier/blob/e6a9bb99b5a6f71d5a34336b8245e305f5430f99/license_type.go#L341
    go-licenses check ./... --ignore flex --disallowed_types=forbidden,unknown
    cd ..
