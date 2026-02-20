# Accounting Point Adapter API for local development and testing.
from flask import Flask
from client.models import (
    AccountingPoint,
    EndUser,
    EndUserEntityType,
    EnergyDirection,
    EnergyDirectionDirection,
    EnergySupplier,
    MeteringGridArea,
)
from datetime import datetime
from client.types import UNSET


app = Flask(__name__)


# These values are just taken from the test data set that is always generated
# in our local test environment.
# Check the db/test_data package for how this stuff is generated.

# TODO get energy supplier gln, not the SO gln. Also get end user id.
TEST_DATA_SUFFIX_TO_GLN_MGA_MBA = {
    "000": ("1337000000044", "42Y-COMMON-SHA-W"),
    "001": ("1337000100041", "42Y-TEST-SUITE-6"),
    "002": ("1337000200048", "42Y-EMIL-POST--Q"),
}


@app.route("/accounting_point/<string:gsrn>", methods=["GET"])
def read_accounting_point(gsrn: str):
    if len(gsrn) != 18 or not gsrn.isdigit():
        return "Invalid gsrn", 400

    test_data_suffix = gsrn[11:14]

    if test_data_suffix not in TEST_DATA_SUFFIX_TO_GLN_MGA_MBA:
        return "Invalid local test account", 404

    test_data_so_gln, test_data_mga = TEST_DATA_SUFFIX_TO_GLN_MGA_MBA[test_data_suffix]

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
                business_id=test_data_so_gln,
                valid_from=VALID_FROM,
            )
        ],
        end_user=[
            EndUser(
                business_id="123456789",  # TODO actual test organization number or fødselsnummer
                entity_type=EndUserEntityType.ORGANISATION,
                valid_from=VALID_FROM,
                valid_to=VALID_TO,
            )
        ],
        energy_direction=[
            EnergyDirection(
                direction=EnergyDirectionDirection.CONSUMPTION,
                valid_from=VALID_FROM,
                valid_to=UNSET,
            )
        ],
    ).to_dict()


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=8080)
