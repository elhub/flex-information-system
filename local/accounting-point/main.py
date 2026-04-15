# Accounting Point Adapter API for local development and testing.
from flask import Flask
from client.models import (
    AccountingPoint,
    EndUser,
    EndUserEntityType,
    EnergyDirection,
    EnergyDirectionDirectionItem,
    EnergySupplier,
    MeteringGridArea,
)
from datetime import datetime

app = Flask(__name__)


# These values are just taken from the test data set that is always generated
# in our local test environment.
# Check the db/test_data package for how this stuff is generated.
# Also https://elhub.github.io/flex-information-system/guides/test-data/

TEST_DATA_SUFFIX_TO_EU_ES_MGA = {
    "000": ("13370000000", "1337000000020", "42Y-COMMON-SHA-W"),
    "001": ("13370000001", "1337000100027", "42Y-TEST-SUITE-6"),
    "002": ("emil.post@example.com", "1337000200024", "42Y-EMIL-POST--Q"),
}


@app.route("/accounting_point/<string:gsrn>", methods=["GET"])
def read_accounting_point(gsrn: str):
    if len(gsrn) != 18 or not gsrn.isdigit():
        return "Invalid gsrn", 400

    test_data_suffix = gsrn[11:14]

    if test_data_suffix not in TEST_DATA_SUFFIX_TO_EU_ES_MGA:
        return "Invalid local test account", 404

    test_data_eu, test_data_es_gln, test_data_mga = TEST_DATA_SUFFIX_TO_EU_ES_MGA[
        test_data_suffix
    ]

    T1 = datetime.fromisoformat("2023-05-01T00:00:00+02:00")
    T2 = datetime.fromisoformat("2024-01-01T00:00:00+01:00")
    T3 = datetime.fromisoformat("2099-01-01T00:00:00+01:00")

    return AccountingPoint(
        gsrn=gsrn,
        metering_grid_area=[
            MeteringGridArea(
                business_id=test_data_mga,
                valid_from=T1,
            )
        ],
        energy_supplier=[
            EnergySupplier(
                business_id="1337000000020",
                valid_from=T1,
                valid_to=T2,
            ),
            EnergySupplier(
                business_id=test_data_es_gln,
                valid_from=T2,
                valid_to=T3,
            ),
        ],
        end_user=[
            EndUser(
                "13370000000",
                entity_type=EndUserEntityType.PERSON,
                valid_from=T1,
                valid_to=T2,
            ),
            EndUser(
                business_id=test_data_eu,
                entity_type=EndUserEntityType.PERSON,
                valid_from=T2,
            ),
        ],
        energy_direction=[
            EnergyDirection(
                direction=[EnergyDirectionDirectionItem.PRODUCTION],
                valid_from=T2,
            )
        ],
    ).to_dict()


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=8080)
