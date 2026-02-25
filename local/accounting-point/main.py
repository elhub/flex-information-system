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
from client.types import UNSET


app = Flask(__name__)


# These values are just taken from the test data set that is always generated
# in our local test environment.
# Check the db/test_data package for how this stuff is generated.
# Also https://elhub.github.io/flex-information-system/guides/test-data/

TEST_DATA_SUFFIX_TO_ES_MGA = {
    "000": ("1337000000020", "42Y-COMMON-SHA-W"),
    "001": ("1337000100027", "42Y-TEST-SUITE-6"),
    "002": ("1337000200024", "42Y-EMIL-POST--Q"),
}


@app.route("/accounting_point/<string:gsrn>", methods=["GET"])
def read_accounting_point(gsrn: str):
    if len(gsrn) != 18 or not gsrn.isdigit():
        return "Invalid gsrn", 400

    test_data_suffix = gsrn[11:14]

    if test_data_suffix not in TEST_DATA_SUFFIX_TO_ES_MGA:
        return "Invalid local test account", 404

    test_data_es_gln, test_data_mga = TEST_DATA_SUFFIX_TO_ES_MGA[test_data_suffix]

    VALID_FROM = datetime.fromisoformat("2024-01-01T00:00:00+01:00")
    VALID_TO = datetime.fromisoformat("2024-12-31T00:00:00+01:00")

    return AccountingPoint(
        gsrn=gsrn,
        metering_grid_area=[
            MeteringGridArea(
                business_id=test_data_mga,
                valid_from=VALID_FROM,
            )
        ],
        energy_supplier=[
            EnergySupplier(
                business_id=test_data_es_gln,
                valid_from=VALID_FROM,
            )
        ],
        end_user=[
            EndUser(
                business_id="13370000" + test_data_suffix,
                entity_type=EndUserEntityType.PERSON,
                valid_from=VALID_FROM,
                valid_to=VALID_TO,
            )
        ],
        energy_direction=[
            EnergyDirection(
                direction=[EnergyDirectionDirectionItem.CONSUMPTION],
                valid_from=VALID_FROM,
                valid_to=UNSET,
            )
        ],
    ).to_dict()


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=8081)
