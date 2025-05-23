# Privacy and Cookies

This documentation and the flexibility pilot platform is developed by Elhub.
Please read the general
[Elhub privacy policy](https://elhub.no/personvern-og-sikkerhet/personvern-i-elhub/).

The service offered on this domain does use cookies and other storage mechanisms
in your browser to store user preferences and session information. These are
neccessary for the site to function properly. We do **not** use this information
to track you as a user. The following is a list of information that is stored on
your device.

<!-- markdownlint-disable MD033 -->
<table>
    <tr>
        <th>Key</th>
        <th>Storage type</th>
        <th>Expires</th>
        <th>Purpose and information</th>
    </tr>
    <tr>
        <td>flex_login</td>
        <td>cookie</td>
        <td>2 minutes</td>
        <td>
            Cookie used to persist information during the login flow.
            Removed when login is done.
        </td>
    </tr>
    <tr>
        <td>__Host-flex_session</td>
        <td>cookie</td>
        <td>1 hour</td>
        <td>Session cookie that is set after you log in. Removed on logout.</td>
    </tr>
    <tr>
        <td>flexSession</td>
        <td>localStorage</td>
        <td>On logout</td>
        <td>
            A local copy of current session information.
            Used to speed up interactions in the portal.
        </td>
    </tr>
    <tr>
        <td>mosaic-theme</td>
        <td>localStorage</td>
        <td>-</td>
        <td>
            Stores configuration for the theme used in API documentation.
        </td>
    </tr>
    <tr>
        <td>RaStoreFlex.*</td>
        <td>localStorage</td>
        <td>On logout</td>
        <td>
            We are storing user preferences and current portal state
            in localStorage with the prefix RaStoreFlex. This includes
            information like if the menu is open/closed,
            current pagination information and similar.
            This is neccessary to provide a good user experience.
        </td>
    </tr>
</table>

In addition to the above we use a
[login solution from Oracle](https://docs.oracle.com/en-us/iaas/Content/Identity/getstarted/identity-domains.htm)
in test environments. Oracle has their own
[privacy policy](https://www.oracle.com/legal/privacy/?er=221886).
