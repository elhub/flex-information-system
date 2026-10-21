# Adapter API for local development and testing.
from flask import Flask, jsonify
from client.models import (
    AccountingPoint,
    AccountingPointEndUser,
    AccountingPointEndUserEntityType,
    AccountingPointEnergyDirection,
    AccountingPointEnergySupplier,
    AccountingPointMeteringGridArea,
    EnergyDirection,
    MeteringGridArea,
    MeteringGridAreaPriceArea,
    MeteringGridAreaSystemOperator,
    PriceArea,
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
    # "002": ("emil.post@example.com", "1337000200024", "42Y-EMIL-POST--Q"),
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
            AccountingPointMeteringGridArea(
                business_id=test_data_mga,
                valid_from=T1,
            )
        ],
        energy_supplier=[
            AccountingPointEnergySupplier(
                business_id="1337000000020",
                valid_from=T1,
                valid_to=T2,
            ),
            AccountingPointEnergySupplier(
                business_id=test_data_es_gln,
                valid_from=T2,
                valid_to=T3,
            ),
        ],
        end_user=[
            AccountingPointEndUser(
                "13370000000",
                entity_type=AccountingPointEndUserEntityType.PERSON,
                valid_from=T1,
                valid_to=T2,
            ),
            AccountingPointEndUser(
                business_id=test_data_eu,
                entity_type=AccountingPointEndUserEntityType.PERSON,
                valid_from=T2,
            ),
        ],
        energy_direction=[
            AccountingPointEnergyDirection(
                direction=[EnergyDirection.PRODUCTION],
                valid_from=T2,
            )
        ],
    ).to_dict()


# Metering grid areas returned by the adapter, for testing the sync job.
# Always the same data. It starts from the MGA test data (see
# db/test_data/test_data.sql), with a few changes so that the effect of the sync
# job can be checked in the database. Expected result after sync with finalise:
#
# - 31Y-COMMON-SHA-Q: identical to the test data, nothing changes
# - 42Y-COMMON-SHA-W: renamed, the MGA row is updated
#                     + its system operator record is terminated (valid_to set),
#                     the record is updated in place
# - 31Y-TEST-SUITE-0: not active anymore, status becomes inactive
# - 42Y-TEST-SUITE-6: price area record terminated and followed by a new price
#                     area, one record updated + one record created
# - 31Y-EMIL-POST--K: system operator record terminated and followed by a new
#                     system operator, one record updated + one record created
# - 42Y-EMIL-POST--Q: missing, the MGA becomes inactive and its system operator
#                     and price area records are deleted
# - 27YCEST-LA-RE7-U: new MGA, created with its system operator and price area
def _t(iso: str) -> datetime:
    return datetime.fromisoformat(iso)


T_START = _t("2023-10-01T00:00:00+02:00")
T_END_OF_2026 = _t("2026-12-31T00:00:00+01:00")

SO_COMMON = "1337000000044"
SO_TEST = "1337000100041"
SO_EMIL = "1337000200048"

METERING_GRID_AREAS = [
    MeteringGridArea(
        business_id="31Y-COMMON-SHA-Q",
        name="Common Shared AREA 1",
        is_active=True,
        system_operator=[
            MeteringGridAreaSystemOperator(business_id=SO_COMMON, valid_from=T_START),
        ],
        price_area=[
            MeteringGridAreaPriceArea(price_area=PriceArea.NO4, valid_from=T_START),
        ],
    ),
    MeteringGridArea(
        business_id="42Y-COMMON-SHA-W",
        name="Common Shared AREA 2 RENAMED",
        is_active=True,
        system_operator=[
            MeteringGridAreaSystemOperator(
                business_id=SO_COMMON, valid_from=T_START, valid_to=T_END_OF_2026
            ),
        ],
        price_area=[
            MeteringGridAreaPriceArea(price_area=PriceArea.NO3, valid_from=T_START),
        ],
    ),
    MeteringGridArea(
        business_id="31Y-TEST-SUITE-0",
        name="Test Suite AREA 1",
        is_active=False,
        system_operator=[
            MeteringGridAreaSystemOperator(business_id=SO_TEST, valid_from=T_START),
        ],
        price_area=[
            MeteringGridAreaPriceArea(price_area=PriceArea.NO4, valid_from=T_START),
        ],
    ),
    MeteringGridArea(
        business_id="42Y-TEST-SUITE-6",
        name="Test Suite AREA 2",
        is_active=True,
        system_operator=[
            MeteringGridAreaSystemOperator(business_id=SO_TEST, valid_from=T_START),
        ],
        price_area=[
            MeteringGridAreaPriceArea(
                price_area=PriceArea.NO3,
                valid_from=T_START,
                valid_to=_t("2026-01-01T00:00:00+01:00"),
            ),
            MeteringGridAreaPriceArea(
                price_area=PriceArea.NO1,
                valid_from=_t("2026-01-01T00:00:00+01:00"),
            ),
        ],
    ),
    MeteringGridArea(
        business_id="31Y-EMIL-POST--K",
        name="Emil Post AREA 1",
        is_active=True,
        system_operator=[
            MeteringGridAreaSystemOperator(
                business_id=SO_EMIL,
                valid_from=T_START,
                valid_to=_t("2026-01-01T00:00:00+01:00"),
            ),
            MeteringGridAreaSystemOperator(
                business_id=SO_TEST,
                valid_from=_t("2026-01-01T00:00:00+01:00"),
            ),
        ],
        price_area=[
            MeteringGridAreaPriceArea(price_area=PriceArea.NO4, valid_from=T_START),
        ],
    ),
    # 42Y-EMIL-POST--Q is intentionally missing
    MeteringGridArea(
        business_id="27YCEST-LA-RE7-U",
        name="K-RIS AREA 51",
        is_active=True,
        system_operator=[
            MeteringGridAreaSystemOperator(business_id=SO_TEST, valid_from=T_START),
        ],
        price_area=[
            MeteringGridAreaPriceArea(price_area=PriceArea.NO2, valid_from=T_START),
        ],
    ),
]


@app.route("/metering_grid_area", methods=["GET"])
def read_metering_grid_areas():
    return jsonify([mga.to_dict() for mga in METERING_GRID_AREAS])


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=8080)
