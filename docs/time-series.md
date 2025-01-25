# Time series

This document is an overview of time-series in the context of a flexibility
value chain. It is by no means exhaustive or final, but an attempt to capture
some important aspects and needs.

## Primer on time-series

By time series we mean a sequence of data points collected, recorded or stored
at successive points in time, often at regular intervals. The value of a data
point is, in our context, electrical quantities.

### Types

Time series can be of different types. The following is the definition of the
types that we think are relevant in the context of a flexibility value chain.

<!-- markdownlint-disable MD033 -->
<table>
<thead>
  <tr>
    <th>Type</th>
    <th>Norsk</th>
    <th>Description</th>
    <th>Origin</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>Measured values</td>
    <td>Målte verdier, uavhenging av metode</td>
    <td>A measure is a sampling/one-time value of a quantity or capacity. It
is typically done by a sensor or dedicated metering device.</td>
    <td><p>The service provider (technical aggregator) or end user has DMD
data.</p>
<p>The system operator also has so-called SCADA-data from sensors/local
control system/IED.</p></td>
  </tr>
  <tr>
    <td>Metering values</td>
    <td>Målte verdier fra en måler</td>
    <td>Metering is about keeping track of e.g. the flow of energy over a
period using a <em>meter</em>. The recorded values are metered values
and typically comes from smart metersAMS or sub meters.</td>
    <td><p>The system operator has data from conventional and smart meters.
The metering values on accounting points are sent to Elhub and available
there. The system operator also has meter data from other meters in the
grid, e.g. on transformers.</p>
<p>Sub-meter data might be from service providers, system operators or
third parties such as sub-grid owners (malls/industrial parks).
</p></td>
  </tr>
  <tr>
    <td>Calculated values</td>
    <td>Beregnede verdier</td>
    <td>A general term for values that are based on some kind of formula or
calculation. The consumption of a certain asset might be calculated by
using a combination of values from AMS and sub-meters.</td>
    <td></td>
  </tr>
  <tr>
    <td>Baseline</td>
    <td>Prognosert volum over en tidsperiode</td>
    <td><p>A counterfactual reference about the electrical quantities that
would have</p>
<p>been withdrawn or injected if there had been no activation of
services.</p></td>
    <td><p>The calculation of baseline can be done by the service provider
(or its baseline provider), system operator(s) or by a trusted/neutral
entity like FIS or third party/marketplace.</p>
<p>It is assumed that there will be standard methods for calculating
baselines in the long run.</p>
<p>At the current state we should consider that all of these might
provide baselines but acknowledge that the different providers have
different tradeoffs for the value chain. Service providers know the
assets, probably have easier access to high-frequency measurements, but
might lack direct access to metered data and trust (“Bukken og
havresekken”). System operators and trusted/neutral entities do not have
knowledge or easy access to measurements. </p></td>
  </tr>
  <tr>
    <td>Consumption plan</td>
    <td>Produksjonsplan</td>
    <td>These are plans for consumption of energy that are set
<em>before</em> any activation happens for system, balancing, local or
voltage services. </td>
    <td>Plans are provided by service providers. </td>
  </tr>
  <tr>
    <td>Production plan</td>
    <td>Forbruksplan</td>
    <td>These are plans for production of energy that are set
<em>before</em> any activation happens for system, balancing, local or
voltage services.</td>
    <td>Plans are provided by service providers.</td>
  </tr>
  <tr>
    <td>Timetable</td>
    <td>Kjøreplan</td>
    <td><p>This is the plan, after considering the delivery of services –
the actual, continuously updated plan.</p>
<p>Mostly useful for service providers but could also be relevant to
communicate to system operators.</p></td>
    <td></td>
  </tr>
  <tr>
    <td>Activated volume</td>
    <td>Aktivert volum</td>
    <td><p>The delivered volume. Calculated using the respective
baseline,</p>
<p>when necessary, and taking into account compensation effects, if
applicable</p></td>
    <td></td>
  </tr>
  <tr>
    <td>Delivered volume</td>
    <td>Levert volum</td>
    <td>Same as activated volume.</td>
    <td></td>
  </tr>
  <tr>
    <td>Verified volume</td>
    <td>Verifisert volum</td>
    <td>Same as activated volume but with additional verification done by
system operator.</td>
    <td></td>
  </tr>
  <tr>
    <td>Traded volume</td>
    <td>Handlet volum</td>
    <td>This is the volume as agreed in the market/bids. Useful to compare
against the actually activated volume.</td>
    <td></td>
  </tr>
</tbody>
</table>

There are other types of time series-like data that is highly relevant
for baselining or optimization but is not included because we believe
that it is not relevant for others in the value chain. Examples are
weather data, moving holidays, spot-prices, grid-tariffs and so on.

### Levels

Time series may come from various resources or assets and may be
referred to logical or physical levels based on what they represent,
whether that being individual, grouped of combined. The logical levels
are:

- Service Providing Group (**SPG**) / Portfolio
- Accounting Point (**AP**) / Metering point (MP)
- Controllable Unit (**CU**)
- Technical Resource (**TR**)

There are also some *physical* levels, represented by meters or
measurement devices:

- Advanced Metering System (**AMS**) meters
- Sub-Meters (**SM**) – *meters that are not AMS*
- Dedicated measurement device (**DMD**)

### Characteristics

The nature of a time-series can vary greatly, some characteristics to
consider are

- **Granularity** - Time-resolution expressed as a duration like 1h,
  15m and similar
- **Quality** – e.g. is it measured or metered and accuracy of
  measurements and baselines
- **Reliability** – in the data stream
- **Frequency** – delay in the data stream
- **Timeline** – e.g. future or historic data
- **Audit** – essentially bi-temporal data

## Non- or over-consumed energy due to activation of flexibility

Activation of balancing and local services from *fully* *independent* service
providers impacts the balance responsible party (BRP) and energy supplier (ES)
on the accounting point(s) financially. Non-consumed or over-consumed energy can
result in a financial loss or gain depending on prices, direction of activation
and original balance of the BRP.

The BRP and ES will be impacted in two ways:

- **Financial** - due to less/more energy sold/bought
- **Imbalance settlement** - since the balance of the BRP will be affected by
  the activated volume

The imbalance settlement impact is of course also financial and sometimes work
in “opposite direction” to the direct financial one. We should consider and
handle the impacts independently since prices are different and impact is on ES
vs BRP.

How to handle this in DSO markets is still pending regulation, and the current
approach in the EuroFlex pilot is to *do nothing*. The current situation is also
that a large majority of service providers are BRPs, and not independent.

In the TSO market, a split between roles for Balance Service Provider (BSP) and
BRP is underway. This is not a fully independent service provider, but a small
first step in that direction. Mitigation of the impact on imbalance settlement
will be handled with *imbalance adjustment*, where the imbalance caused by
activation is adjusted in the settlement. The financial impact will be handled
by requiring *bi-lateral agreements* between BSP and the BRP. Also, all bids
will be required to be with the same BRP.

Centrally done *financial transfer*, where money is transferred between the
parties, based on a set price (spot), is another way to mitigate the financial
impact. A more elaborate method, called *financial compensation*, could consider
the actual cost of the BRP and compensate that.

One could also envision using the markets to mitigate the impacts. The BRP could
be notified about activation and do intra-day trading to “cover the difference".
The (D)SO could be required to make a *counter-activation,* i.e. an activation
in the opposite direction to ensure system balance This could be used to
mitigate the impacts if the counter-activation is for the correct BRP/ES. It
will be close to impossible to ensure that as it will require additional methods
for handling impact.

The methods described in this section are summarized in the table below. The
columns *imbalance settlement* and *financial* show if the methods are
applicable to mitigate that specific impact.

<table>
<thead>
  <tr>
    <th>Method</th>
    <th>Imbalance settlement</th>
    <th>Financial</th>
    <th>Comment</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>Do nothing</td>
    <td>YES</td>
    <td>YES</td>
    <td>
        Simple, and can be sufficient if traded volume is not “noticeable”.
        This method is applicable, but not really a full-fledged
        "solution".
    </td>
  </tr>
  <tr>
    <td>Bi-lateral agreement</td>
    <td>NO</td>
    <td>YES</td>
    <td>
        Does not scale and is a barrier to entry for the service providers.
        This is a sort of bi-lateral financial transfer.
    </td>
  </tr>
  <tr>
    <td>Counter-activation</td>
    <td>YES</td>
    <td>NO</td>
    <td>
        Ensures system balance, but will be close to impossible to use for
        mitigating impact
    </td>
  </tr>
  <tr>
    <td>Intra-day trading</td>
    <td>YES</td>
    <td>NO</td>
    <td></td>
  </tr>
  <tr>
    <td>Financial transfer</td>
    <td>NO</td>
    <td>YES</td>
    <td>
        Centrally handled. Price will not be “correct”, but probably good
        enough?
    </td>
  </tr>
  <tr>
    <td>Financial compensation</td>
    <td>NO</td>
    <td>YES</td>
    <td>Complicated.</td>
  </tr>
  <tr>
    <td>Imbalance adjustment</td>
    <td>YES</td>
    <td>NO</td>
    <td></td>
  </tr>
</tbody>
</table>

We believe that the most interesting methods to pilot for local
flexibility markets and a common national flexibility register are *do
nothing,* *imbalance adjustment* and *financial transfer*. It is
ultimately regulation that will decide, but we can investigate if
centrally handled imbalance adjustment and financial transfer is
feasible at a reasonable complexity/cost.

## Challenges

The following are some challenges that has been identified and must be
addressed but are not directly in scope to “solve” in this overview.

### Data privacy

The higher the granularity of data, the more sensitive it becomes. This is
relevant only for personal data, i.e. values tied to a private address or a sole
proprietorship company.

### Trust

The baseline and metered/measured values form the basis for settlement, so we
must have high trust in them. Ensuring trust can be done by making it auditable,
verifiable, follow standard methods and/or vet over time. One can also rely on
“trusted (third-)parties” or requiring baselines in advance.

### Data access and flow

Securing every entitled party access to time-series is one of the challenges we
must solve. Does it flow via a Flexibility Information System (FIS), directly
between the involved parties or via some other platform/mechanism.

### Clock drift

If the time of different meter and measurement equipment is not in sync, then
using those values together will produce incorrect results.

### Granularity and frequency of AMS data

The AMS meters are considered of high integrity, but the lack of 15-minute data
and delay in when the data is available via Elhub makes it less ideal to use for
planning and baselining.

## Needs

The rest of this document contains tables describing needs for different
time-series in the flexibility value chain, based on the different aspects
highlighted above.

In short:

- **Who** – needs and has data
- **What** – the needs are

We are making up some roles/responsibilities that is currently not defined
elsewhere but since it is undefined who will do it, we single them out for
clarity.

- Baseline provider – the party responsible for creating the baseline for a
  given (group of) asset(s)
- Activated volume calculator – the party responsible for calculating activated
  volume

This document does **not** intend to specify any *technical
requirements* to data interchange formats, though we should not be
scared of recording some details, e.g. about current
implementation/requirements.

We generally want to express needs in a user-story like format. However,
it also makes sense to structure the data in tabular format for easier
filtering and mental processing.

As such, we have tried to specify tables that accommodate something that
looks like a [Five Ws user story
template](https://en.wikipedia.org/wiki/User_story) like phrase.

> As `<who>`, I want `<need/level/resolution/frequency>` because
> `<purpose>`

Some abbreviations

- **ISP** – imbalance settlement period (1h / 15 m)

<table>
<thead>
  <tr>
    <th>Who</th>
    <th>Need</th>
    <th>Level</th>
    <th>Res.</th>
    <th>Frequency</th>
    <th>Purpose</th>
    <th>Notes</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>Imbalance settlement responsible</td>
    <td>Activated volume</td>
    <td>AP</td>
    <td>ISP</td>
    <td>D+1</td>
    <td>Do imbalance adjustment per balance responsible party.</td>
    <td>
        Relevant for TSO markets <strong>if</strong> regulation allows fully
        independent service providers. Relevant for DSO markets
        <strong>if</strong> regulation states that imbalance adjustment must be
        done.
    </td>
  </tr>
  <tr>
    <td>Balance Responsible Party and Service Providers</td>
    <td>Activated volume</td>
    <td>AP</td>
    <td>ISP</td>
    <td>D+1</td>
    <td>Do financial transfers with energy suppliers.</td>
    <td>
        When BRP/SP is responsible for the financial settlement with SP/ES
        due to relying on bi-lateral agreement between SP and BRP.
    </td>
  </tr>
  <tr>
    <td>Energy Supplier</td>
    <td>Activated volume</td>
    <td>AP</td>
    <td>ISP</td>
    <td>D+1</td>
    <td>To be informed about activations</td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td>Flexibility market</td>
    <td>Activated volume</td>
    <td>SPG</td>
    <td>15m</td>
    <td>Same day</td>
    <td>Settle the activated flex.</td>
    <td>
        Depending on the market/rules, this can be pay-as-bid, calculated
        with use of baseline.
    </td>
  </tr>
  <tr>
    <td>Flexibility marked</td>
    <td>Baseline</td>
    <td>SPG</td>
    <td>15m</td>
    <td>Ahead of trading</td>
    <td>Bid screening and ensuring that there is “available” flex</td>
    <td>This is currently done in both NODES and Statnett markets.</td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td>Service provider</td>
    <td>Activated volume</td>
    <td>AP/CU</td>
    <td>15m</td>
    <td>Same day</td>
    <td>Share rewards with end user.</td>
    <td>It is not given that the SP will distribute rewards based on the
actual activated volume per CU. Depends on the agreement between the SP
and end user.</td>
  </tr>
  <tr>
    <td>Service provider</td>
    <td>Metered values</td>
    <td>SM/AMS</td>
    <td>15m</td>
    <td>Real time</td>
    <td>Planning and optimizations</td>
    <td></td>
  </tr>
  <tr>
    <td>Baseline provider</td>
    <td>Measured values</td>
    <td>TR</td>
    <td>1m</td>
    <td>Real time</td>
    <td>Create good baselines</td>
    <td></td>
  </tr>
  <tr>
    <td>Baseline provider</td>
    <td>Metered values</td>
    <td>SM/AMS</td>
    <td>15m</td>
    <td>Real time</td>
    <td>Create good baselines</td>
    <td></td>
  </tr>
  <tr>
    <td>Activated volume calculator</td>
    <td>Metered values</td>
    <td></td>
    <td>15m</td>
    <td>Same day</td>
    <td>Calculate activated volume</td>
    <td>
        It is not given that the Activated volume is derived from
        baseline/metered on the same level. An example can be for groups:
        Baseline and activated is calculated on the SPG level, then the
        activated is “distributed” on the CUs via some key/algorithm.
    </td>
  </tr>
  <tr>
    <td>Activated volume calculator</td>
    <td>Baseline</td>
    <td></td>
    <td>15m</td>
    <td>Same day</td>
    <td>Calculate activated volume</td>
    <td></td>
  </tr>
  <tr>
    <td>System operator</td>
    <td>Baseline</td>
    <td>CU/AP</td>
    <td>At least ISP</td>
    <td>Same day</td>
    <td>Validate the provision of the service</td>
    <td></td>
  </tr>
  <tr>
    <td>System operator</td>
    <td>Baseline</td>
    <td></td>
    <td></td>
    <td>Continuously ahead of trading</td>
    <td>Validate baseline (if provided by service provider)</td>
    <td>
        Validating baseline can be done by comparing the baseline to actual
        metered values over time.
    </td>
  </tr>
  <tr>
    <td>System operator</td>
    <td>Metered values</td>
    <td>AP/AMS</td>
    <td>At least ISP</td>
    <td></td>
    <td>Validate the provision of the service</td>
    <td>
        Procuring system operator might not be the connecting system
        operator, so they might not have this data.
    </td>
  </tr>
</tbody>
</table>
