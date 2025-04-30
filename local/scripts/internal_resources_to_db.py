import j2

DB_DIR = "./db"

if __name__ == "__main__":
    resources = [
        {
            "id": r,
            "history": True,
            "audit": True,
        }
        for r in [
            "accounting_point_balance_responsible_party",
            "accounting_point_end_user",
            "accounting_point_energy_supplier",
            "metering_grid_area",
            "accounting_point_metering_grid_area",
            "energy_supplier_balance_responsibility",
        ]
    ]

    for resource in resources:
        j2.template(
            resource,
            "resource_history_audit.j2.sql",
            f"{DB_DIR}/flex/{resource['id']}_history_audit.sql",
        )
