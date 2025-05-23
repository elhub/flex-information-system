# Test Data

<!-- markdownlint-disable MD033 MD041 MD013-->

Each test user has its own set of test data generated into the system. This includes:

* a set of parties that can be used to interact with the system - one of each type
* a set of 1000 accounting point that is connected to the test users system operator

To facilitate testing across parties, e.g. with multiple service providers,
there is also a "common" set of parties that can be used.

## Party names

The party names are set using the test user's first name and just appends
the party abbreviation to it. For example, if the test user's first name is
`John`, the party names will be `John SP`, `John SO`, etc.

For the common test user, the party names are `Felles SP`, `Felles SO`, etc.

## Generated GLN and GSRN

`GLN` is used for party identifiers and `GSRN` is used for accounting point
identifiers.

The test data is generated using the *last three digits* of the fake social
security number (SSN) of the test user. This means that the test data
for a user with SSN `12345678901` will be generated using the last
three digits `901`.

One "problem" with GLNs and GSRNs is that they have a
[check digit](https://www.gs1.org/services/how-calculate-check-digit-manually)
as a final digit. This means that you as a test user simply cannot increment to
the "next" id. Therefore we provide functionality below to show the test data
based on the last three digits of the SSN.

The format of the GLN and GSRN is as follows:

* **GLN** - `13370` + 3-digit SSN suffix + 4-digit increment + check digit
* **GSRN** - `13370000000` + 3-digit SSN suffix + 3-digit increment + check digit

Use the input boxes to change the SSN suffix and the user's first name.
Your test data will show up below.

> [!TIP]
> The values for the common test user is `0` and `Felles`.
<script type="text/javascript">

    // https://alpinejs.dev/advanced/csp
    document.addEventListener('alpine:init', () => {
        Alpine.data('testdatainfo', () => {
            return {
                suffix: 0,
                firstName: 'Felles',
                parties: ['BRP','EU','ES','MO','SO','SP','TP','FISO'],
                numAccountingPoints: 1000,
                calculateCheckDigit(code) {
                    const sum = code.split('')
                        .reverse()
                        .map((n, i) => n * (i % 2 ? 1 : 3))
                        .reduce((sum, n) => sum + n, 0)

                    const roundedUp = Math.ceil(sum / 10) * 10;

                    const checkDigit = roundedUp - sum;

                    return checkDigit;
                },
                generateGLN() {
                    var index = this.$data.index;
                    const base = '13370' + this.suffix.toString().padStart(3, '0') + index.toString().padStart(4, '0');
                    return base + this.calculateCheckDigit(base);
                },
                generateGSRN() {
                    var index = this.$data.index - 1;
                    const base = '13370000000' + this.suffix.toString().padStart(3, '0') + index.toString().padStart(3, '0');
                    return base + this.calculateCheckDigit(base);
                },
                setFirstName(event) {
                    this.firstName = event.target.value;
                },
                setSuffix(event) {
                    this.suffix = event.target.value;
                },
                partyName() {
                    var party = this.$data.party;
                    return this.firstName + ' ' + party;
                }
            }
        })
    })
</script>
<div id="testdata-gen" x-data="testdatainfo">
    <style type="text/css">
        #testdata-gen input{
            background: transparent;
            border: none;
            border-bottom: solid 1px #ccc;
            padding: 5px;
            transition: padding 0.4s;
        }
        #testdata-gen .input-box {
            margin-bottom: 10px;
        }
    </style>
    <div class="input-box">
        <label for="suffix">SSN Suffix:</label>
        <input id="suffix" type="number" :value="suffix" @input="setSuffix" min="0" max="999" />
    </div>
    <div class="input-box">
        <label for="firstName">User Firstname:</label>
        <input id="firstName" type="text" :value="firstName" @input="setFirstName" pattern="[A-Za-z]+" />
    </div>

    <h3>Parties</h3>
    <p>
        These are the test parties for <em x-text="firstName"></em>.
    </p>
    <ul>
        <template x-for="(party, index) in parties">
            <li>
                <span x-text="generateGLN"></span>
                -
                <span x-text="partyName"></span>
            </li>

        </template>
    </ul>
    <h3>Accounting points</h3>
    <p>
        This list contains 1000 accounting points where
        <em x-text="firstName"></em> is the connecting system operator.
    </p>
    <ul>
        <template x-for="index in numAccountingPoints">
            <li>
                <span x-text="generateGSRN"></span>
            </li>
        </template>
</div>
<script src="https://cdn.jsdelivr.net/npm/@alpinejs/csp@3/dist/cdn.min.js"></script>
