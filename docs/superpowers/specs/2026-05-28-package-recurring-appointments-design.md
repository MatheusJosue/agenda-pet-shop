# Package Recurring Appointments Design

## Goal

When a user creates an appointment charged to a pet package, the system should automatically reserve the remaining package appointments using the selected date and time as the recurrence anchor.

## Behavior

- Package appointments created from the new appointment screen generate a sequence immediately.
- The recurrence interval comes from `package_types.interval_days`.
- Weekly packages repeat every 7 days at the same time.
- Biweekly packages repeat every two weeks at the same weekday and time.
- Monthly packages repeat monthly from the selected day at the same time, clamping to the last valid day when a month is shorter.
- The number of appointments is limited by the package credits available.
- Each generated appointment consumes the same number of package credits as the number of selected services.
- One-off appointments and non-package appointments keep their current behavior.

## Data Flow

The new appointment page sends an explicit recurrence flag when the billing type is `pacote`. The `createAppointment` server action validates the package, calculates how many appointments can be created, inserts the appointment rows, inserts matching `appointment_services` rows, and updates `pet_packages.credits_remaining` once for the full sequence.

## Error Handling

If the package is missing, expired, inactive, or has insufficient credits for at least one appointment, the action returns the current package error messages. If service linking or credit update fails, inserted appointments and services are rolled back by deletion.

## Testing

Verify with the production build and focused manual checks:

- weekly package creates one appointment per available credit interval;
- biweekly package advances by 15 days;
- monthly package preserves the day when possible;
- avulso appointments still create only one record.
