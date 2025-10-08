# Mock Elhub API for local development and testing.
from flask import Flask

app = Flask(__name__)


# These values are just taken from the test data set that is always generated
# in our local test environment.
# Check the db/test_data package for how this stuff is generated.
TEST_DATA_SUFFIX_TO_GLN_MGA_MBA = {
    "000": ("1337000000044", "42X-COMMON-SHA-9", "NO4"),
    "001": ("1337000100041", "42X-TEST-SUITE-K", "NO4"),
    "002": ("1337000200048", "42X-EMIL-POST--3", "NO4"),
}


@app.route("/energy-data/v0/metering-points/<string:mp_id>", methods=["GET"])
def read_metering_point(mp_id):
    if len(mp_id) != 18 or not mp_id.isdigit():
        return "Invalid metering point ID", 400

    test_data_suffix = mp_id[11:14]

    if test_data_suffix not in TEST_DATA_SUFFIX_TO_GLN_MGA_MBA:
        return "Invalid local test account", 404

    test_data_so_gln, test_data_mga, test_data_mba = TEST_DATA_SUFFIX_TO_GLN_MGA_MBA[
        test_data_suffix
    ]

    # The response is a simplified version of a real response from Elhub obtained from
    # https://api.elhub.no/energy-data/v0/metering-points/<valid mpid>
    # We only care about the data attribute so we have removed some of the other fields.
    return {
        "data": [
            {
                "attributes": {"status": "Active"},
                "id": mp_id,
                "relationships": {
                    "grid-area": {"data": {"id": test_data_mga, "type": "grid-areas"}},
                    "grid-owner": {"data": {"id": test_data_so_gln, "type": "parties"}},
                    "price-area": {
                        "data": {"id": test_data_mba, "type": "price-areas"}
                    },
                },
                "type": "metering-points",
            }
        ]
    }


if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host="0.0.0.0", debug=True, port=80)
