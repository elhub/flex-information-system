# Time Series

This document is an overview of time-series in the context of a flexibility
value chain. It is by no means exhaustive or final, but an attempt to capture
some important aspects and needs.

By time series we mean a sequence of data points collected, recorded or stored
at successive points in time, often at regular intervals. The value of a data
point is, in our context, electrical quantities.

## Types

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
    <td>
      A measure is a sampling/one-time value of a quantity or capacity. It
      is typically done by a sensor or dedicated metering device.
    </td>
    <td>
      <p>The service provider (technical aggregator) or end user has DMD
      data.</p>
      <p>The system operator also has so-called SCADA-data from sensors/local
      control system/IED.</p>
    </td>
  </tr>
  <tr>
    <td>Metering values</td>
    <td>Målte verdier fra en måler</td>
    <td>
      Metering is about keeping track of e.g. the flow of energy over a
      period using a <em>meter</em>. The recorded values are metered values
      and typically comes from smart meters (often referred to as AMS) or
      dedicated meters.
    </td>
    <td>
      <p>The system operator has data from conventional and smart meters.
      The metering values on accounting points are sent to Elhub and available
      there. The system operator also has meter data from other meters in the
      grid, e.g. on transformers.</p>
    </td>
  </tr>
  <tr>
    <td>Calculated values</td>
    <td>Beregnede verdier</td>
    <td>
      A general term for values that are based on some kind of formula or
      calculation. The consumption of a certain asset might be calculated by
      using a combination timeseries from different sources.
    </td>
    <td></td>
  </tr>
  <tr>
    <td>Baseline</td>
    <td>Prognose / Prognosert volum over en tidsperiode</td>
    <td>
      A counterfactual reference about the electrical quantities that
      would have been withdrawn or injected if there had been no activation of
      services.
    </td>
    <td>
      The calculation of baseline can be done by the service provider
      (or its baseline provider), system operator(s) or by a trusted/neutral
      entity like FIS or third party/marketplace system.
    </td>
  </tr>
  <tr>
    <td>Consumption plan</td>
    <td>Forbruksplan</td>
    <td>
      These are plans for consumption of energy that are set
      <em>before</em> any activation happens for system, balancing, local or
      voltage services.
    </td>
    <td>Plans are provided by service providers. </td>
  </tr>
  <tr>
    <td>Production plan</td>
    <td>Produksjonsplan</td>
    <td>
      These are plans for production of energy that are set
      <em>before</em> any activation happens for system, balancing, local or
      voltage services.
    </td>
    <td>Plans are provided by balance responsible parties or service providers.</td>
  </tr>
  <tr>
    <td>Timetable</td>
    <td>Kjøreplan</td>
    <td>
      <p>This is the plan, after considering the delivery of services –
      the actual, continuously updated plan.</p>
      <p>Mostly useful for service providers but could also be relevant to
      communicate to system operators.</p>
    </td>
    <td></td>
  </tr>
  <tr>
    <td>Activated volume</td>
    <td>Aktivert volum</td>
    <td>
      The delivered volume. Calculated using the respective
      baseline, when necessary, and taking into account compensation effects, if
      applicable
    </td>
    <td></td>
  </tr>
  <tr>
    <td>Delivered volume</td>
    <td>Levert volum</td>
    <td>Same as activated volume.</td>
    <td></td>
  </tr>
  <tr>
    <td>Quantified volume</td>
    <td>Kvantifisert volum</td>
    <td>Same as activated volume.</td>
    <td></td>
  </tr>
  <tr>
    <td>Verified volume</td>
    <td>Verifisert volum</td>
    <td>
      Same as activated volume but with additional verification done by
      system operator.
    </td>
    <td></td>
  </tr>
  <tr>
    <td>Traded volume</td>
    <td>Handlet volum</td>
    <td>
      This is the volume as agreed in the market/bids. Useful to compare
      against the actually activated volume.
    </td>
    <td></td>
  </tr>
</tbody>
</table>

There are other types of time series-like data that is highly relevant
for baselining or optimization but is not included because we believe
that it is not relevant for others in the value chain. Examples are
weather data, moving holidays, spot-prices, grid-tariffs and so on.

## Logical levels

Time series are usually linked to logical levels, typically the
resources we use to model the flexibility domain. These logical levels are:

- Service Providing Group (**SPG**) / Portfolio
- Accounting Point (**AP**) / Metering point (MP)
- Controllable Unit (**CU**) / Asset
- Technical Resource (**TR**)

## Origins

The origin of a time-series is the physical or concrete source of the data, i.e.
where it comes from. We are using this nomenclature to distinguish between the
different types of time-series origins.

| Origin                       | Abbr | Type        | Typical granularity      | Responsible                | Comment                                                                                                                               |
|------------------------------|------|-------------|--------------------------|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Smart meter                  | SM   | Meter       | 15M/60M                  | Connecting System Operator | Often talked about as AMS                                                                                                             |
| Home Area Network-port       | HAN  | Measurement | Minimum every 10 seconds | Service Provider           | HAN port of SM                                                                                                                        |
| Sub meter                    | SUB  | Meter       | 15M/60M                  | Service Provider           | Typically a MID compliant meter used to improve energy transparency and encourage energy-saving behaviors or a meter used in subgrid. |
| Dedicated Measurement Device | DMD  | Measurement |                          | Service Provider           | See below                                                                                                                             |
| Dedicated Meter              | DM   | Meter       | Realtime/1M/15M          | Service Provider           | See below                                                                                                                             |
| Calculated                   | CALC | Virtual     | Realtime/1M/15M          | Service Provider           |                                                                                                                                       |

### DMD vs DM

[Regulation (EU) 2024/1747](https://eur-lex.europa.eu/eli/reg/2024/1747/oj/eng)
defines a Dedicated Measurement Device (DMD) as

> a device linked to or embedded in an asset that provides demand response or
> flexibility services on the electricity market or to system operators

We have chose to "split" this term in two, depending on the nature of the
measurement. If the measurement is a meter, i.e. a device that measures
cumulative flow of energy, then we call it a Dedicated Meter (DM).

### Measuring Instrument Directive (MID)

Directive 2014/32/EU is known as the
[Measuring Instrument Directive](https://en.wikipedia.org/wiki/Measuring_Instruments_Directive)
and outlines the requirements for a wide range of measuring instruments,
including active electrical energy meters. MID compliance means that the meter
gone through an independent conformity assessment.

## Characteristics

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

## Baselines

As defined above, a baseline is a counterfactual reference about the
electrical quantities that would have been withdrawn or injected if there had
been no activation of services.

Baseline can be calculated on any logical level or origin, depending on the use.
It is typically the service provider that has access to the most reliable (and
possibly market sensitive) data that can be used to calculate an accurate
baseline. They also often know the most about the assets general usage patterns.
In situations where there is other loads on the same accounting point, it is
unlikely that the service provider (or anyone else for that matter) can
calculate a baseline that is accurate enough to be used for settlement.

Depending on method, baseline can also be calculated by another party, but that
might require data from the service provider to be transferred in advance.

The fundamental problem with a baseline is that it is not possible to verify its
correctness - it is counterfactural after all. We must rather determine a
strategy that helps us to agree that the baseline is trustworthy or acceptable.
There some main strategies to do this that can be used on their own or in combination:

- **Standard method** - calculated using a standard, deterministic, agreed-upon
  method where input data is trusted and the calculation can be repeted at any
  point in time.
- **Auditable method** - calculated using a method that can be audited, e.g. by
  providing the input data and method.
- **Trusted party** - calculated by a trusted (third-)party with no vested
  interest in the outcome
- **Validate over time** - calculated and communicated ahead-of-time and
  validated continuously/over time by comparing it to actual metered values when
  no trade is going on. This requires that the baseline is calculated
  continuously.

Each of these strategies allows different methods of calculating baselines as
well as put different requirements on the systems and the service provider.

### Baseline methods

The following sections outline some of the methods that can be used to calculate
baselines. These are methods that has been surfaced in our work group
discussions.

#### Black box

The baseline is calculated using an unspecified method that is considered a "black
box" by the value chain. This is typically done by the service provider (SP), potentially
based on confidential input, using a proprietary algorithm.

The black box method is the one that allows for the most innovation and allows
the SP to use the best available data and methods, e.g. machine learning.
However, it is also the most opaque and ensuring trust in this baseline can only
be done by validating it over time.

#### Plan

This method uses a consumption or production plan as the baseline. Similar to
the black box method, the plan can be validated over time to ensure trust in its
accuracy. This method is only applicable to assets that are actively managed and
have a clear operational profile, like industrial processes.

#### Meter before

The "Meter before" method uses the metered values before the activation as the
baseline. This method should use the metered values for the same time period as
the Imbalance Settlement Period (ISP) - 1h or 15m - as values typically will
fluctuate between the ISPs.

#### Meter before and after

Similar to the "Meter before" method, but uses an average of the metered values
before and after.

#### Sliding window

A sliding window baseline is a baseline that is calculated using a sliding
window of historical data. The window is typically a fixed time period, e.g.
the last 5 days, and the baseline is calculated using the data in that window.

This method can also use other inputs such as weather data, holidays,
and other factors that can impact the consumption or production of energy.

#### Zero

The baseline is set to zero. Could be useful e.g. for fossil fuel generators or
batteries. It can only be used if the asset is in contracted to not consume and/or
produce energy for the periods it is part of a reservation contract.

## Quantification and verification

After the delivery of a service, it must be established if the service was delivered
according to the bid and the product requirements. We conceptually split this task
in two, mainly based on why we do it and how often it is done. We call these activities
*quantification* and *verification*.

The activites *can* be equal in practice, but different in what we are trying to
achieve. The following table summarizes the key reasons why it is useful to
think about it as two things. The following two chapters we describe this in
more detail.

| Aspect    | Quantification                  | Verification                                                          |
|-----------|---------------------------------|-----------------------------------------------------------------------|
| Purpose   | Settlement of service           | Quality assurance of service delivery or instead of prequalification  |
| Frequency | After each and every activation | Ad-hoc or at certain intervals                                        |
| Level     | SPG and AP/CU                   | SPG                                                                   |
| Target    | Volume                          | Volume and quality                                                    |
| Methods   | Can use simplified methods      | Usually more detailed and thorough methods                            |

> [!NOTE]
>
> How to do quantification and verification will vary between different products
> *and service providing groups*. Sometimes, e.g. when the the group is "simple"
> and the quantification method is based on trusted data and a detailed method,
> then quantification and verification is the same activity.

### Quantification

Quantification is the continuous activity of calculating the delivered volume
after *each and every* activation. The purpose of quantification is to be able
to do settlement. Quantification is about establishing the quantity of energy
that was delivered, using a method that gives "good" and "fair" enough result
for us to agree to using it.

There are three main methods for quantifying the activated volume:

- **Assumed delivery** - where the activated volume is assumed to be the
  same as what was traded in the market.
- **Baseline comparison** - where the activated volume is calculated by comparing
  the baseline to the metered values.
- **Reported delivery** - where the activated volume is reported by the
  service provider based on agreed upon terms.

Quantification is done to support three types of settlement:

- **Quantification for service settlement** - must end up on the SPG
  level since that is where the bids are.
- **Quantification for imbalance adjustment and financial transfer** - must be
  done at the level of accounting point (AP) or lower (CU/TR). NOTE - See the
  section
  [Non- or over-consumed energy due to activation of flexibility](#non--or-over-consumed-energy-due-to-activation-of-flexibility)
  for more details about imbalance settlement.
- **Quantification for end user compensation** - must be done at the level of
  the accounting point (AP) or lower (CU/TR), since that is where the end user
  is linked. While it is the service provider that is responsible for this and
  has the agreement with the end user, it is important that any potential
  flexibility volumes shown in a flexibility information system matches the
  quantities that SP is using to compensate the end user, to avoid confusion and
  distrust.

For some assets it is easy and practical to quantify the activated volume on
the CU or AP level, e.g. a single battery facility or large boilers.

For other cases, such as a group of many small assets, it might not be practical
to quantify the activated volume on the CU/AP level. By quantifying on the SPG
level, we can use the "law of large numbers" to get a good prediction of the
baseline (and thus the activated volume). Also, if quantification is done using
the *assumed delivery* method, then the quantification happens on the SPG level
per definition.

Having consistent quantification (e.i. the quantification "add up" between the
levels) can follow one one of two main strategies:

- **aggregate** - *sum* - quantification is done on the lower level, e.g. CU or
  TR, and then aggregated to the SPG level.
- **allocate** - *split* . the quantification is done on the SPG level and then
  allocated to the lower levels, using some kind of distribution factor.

Allocation can be done with:

- fixed factors
    - even split
    - per SPG
- dynamic factors
    - assigned by SP per bid/activation - this required [activation data](#activation-data)
    - assigned by doing an approximate quantification on the lower level

### Verification

Verification is a quality assurance activity done by the system operator to
ensure that the delivered service is of sufficient quality and that the agreed
volume has been delivered.

Verification is targeted on the SPG level, where service is delivered.

It might be challenging to properly verify that a service was delivered. Some
challenges are

- access to data of high enough quality and granularity
- a trusted source of data
- noise in data - for instance if the flexible asset represents only part of the
  energy consumption on an accounting point
- finding and applying the correct method to verify the service delivery

Verification can be done for every trade or activation but, given the challenges,
it might be that it is feasible to only do it every now and then. This could for
instance be once at application time (possibly to replace prequalification) and
then ad-hoc or at certain intervals during the lifetime of the service providing
group.

If, however, verification of volume is done for every trade, then we are
basically doing quantification at the same time and the result should be used
for settlement. It is however expected that we will see that quantification is
done with a simplified method or with a higher degree of trust than what
verification implies. Current TSO and DSO markets both quantify with simplified
methods.

The verification might include

- **Compare to trusted data** - Comparing the quantified volume to what is
  observed in the accounting point.
- **Product verification** - Check if the quality of the delivered service is in
  accordance with the product requirements. E.g. by getting additional data from
  the service provider or others and doing analysis on that.
- **Baseline quality** - Check if the baseline is of sufficient quality based on
  the actual measurements.
- **Consistency checks** - Check delivery and bid volume over time to see if
  there are repeated discrepancies or systematic errors.

It is at the system operator's discretion to decide how and when to verify the
service delivery, as long as it does not put an additional/undue burden on the
service provider.

## Activation data

Activation data is the data related to an activation of a flexible resource. For
manual activation markets this is bid acceptance. For automatic reserves it is
when thresholds for delivering service was met. It includes information about

- activated volume
- time period
- service providing group

To be able to quantify the activated volume for imbalance settlement, we might
need to know, after the delivery of service, which CU that was actually
activated. This can be:

- simple boolean - `yes`/`no`
- an actual contribution factor

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

## Metered/Measured Data Administrators

We find the definition of Metered Data Administrator (MDA) e.g. in
[Implementing Regulation (EU) 2023/1162](https://eur-lex.europa.eu/eli/reg_impl/2023/1162/oj/eng).

> means a party responsible for storing validated historical metering and
> consumption data and distributing these data to final customers and/or
> eligible parties;

Elhub is the de-facto MDA in Norway for smart meters on the accounting point
level. There is specific party assigned as administrators for sub-meter or
dedicated meter/measurement device data.

## Challenges

The following are some challenges that has been identified and must be
addressed but are not directly in scope to “solve” in this overview.

### Data privacy

The higher the granularity of data, the more sensitive it becomes. This is
relevant only for personal data, i.e. values tied to a private address or a sole
proprietorship company.

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
    <td>Verifiy the provision of the service</td>
    <td></td>
  </tr>
  <tr>
    <td>System operator</td>
    <td>Updated baseline</td>
    <td>-</td>
    <td>Ahead of trading</td>
    <td>When baseline change</td>
    <td>To have the best available data for verification</td>
    <td></td>
  </tr>
  <tr>
    <td>System operator</td>
    <td>Corrected baseline</td>
    <td>-</td>
    <td>After trading</td>
    <td>When baseline have errors</td>
    <td>To be able to correct in case of errors</td>
    <td></td>
  </tr>
  <tr>
    <td>System operator</td>
    <td>Parallell baselines</td>
    <td>-</td>
    <td>-</td>
    <td>-</td>
    <td>Assess different baseline methods over time</td>
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
    <td>Verify the provision of the service</td>
    <td>
        Procuring system operator might not be the connecting system
        operator, so they might not have this data.
    </td>
  </tr>
</tbody>
</table>
