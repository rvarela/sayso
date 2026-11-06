# Project notes

## Product direction

SaySo is a patient-first communication aid for people with aphasia and other speech difficulties. The interface should minimise cognitive load through large controls, strong contrast, short guided choices, and predictable navigation.

The patient experience uses sentence starters and contextual next-word suggestions. Caregiver controls remain in a separate settings area.

## Current behaviour

- Visual mode is the default for new users.
- Words mode removes the leading pictogram while preserving the option label.
- Selecting an option speaks it immediately and adds it to the message.
- Completed messages can be spoken in full.
- Message segments act as editable breadcrumbs.
- Suggestions are reordered locally according to usage frequency.
- Caregivers can add personal vocabulary to supported categories.
- Personal vocabulary and preferences are stored in browser local storage.
- Voice selection depends on voices available in the current browser and operating system.

## Data and privacy

There is currently no account or server-side patient data. Personal vocabulary, learned suggestion frequency, display mode, and voice choice are stored only in the current browser. Clearing site data removes them, and they do not synchronise between devices.

## Deployment

- Source: <https://github.com/rvarela/sayso>
- Live site: <https://say.madebyshonen.com>
- VPS checkout: `/opt/sayso`
- Static files: `/opt/sayso/site/dist`
- The VPS uses the existing Caddy container managed by `/opt/family-tree-preview/docker-compose.yml`.
- `tree.madebyshonen.com` is a separate application and must remain unaffected by SaySo deployments.

