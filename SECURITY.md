# Security Policy

## Supported versions

Radix Native is pre-1.0. Security fixes are released for the latest published minor version only.

| Version        | Supported |
| -------------- | --------- |
| Latest `0.x`   | Yes       |
| Older releases | No        |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions or pull requests.**

Report them privately through GitHub's private vulnerability reporting:

1. Go to the [Security tab](https://github.com/Atotaro98/radix-native/security) of this repository.
2. Click **Report a vulnerability**, or open the [advisory form](https://github.com/Atotaro98/radix-native/security/advisories/new) directly.
3. Include as much of the following as you can:
   - The affected version of `radix-native` and of `react-native`
   - A description of the issue and its impact
   - Steps to reproduce, or a proof of concept
   - Any suggested fix or mitigation

## What to expect

- An acknowledgement of your report within 7 days.
- An assessment and, if the report is accepted, a plan for a fix. You will be kept informed of progress.
- A fix released as a new version on npm, with a published security advisory that credits you unless you prefer to stay anonymous.

Please give us a reasonable amount of time to release a fix before disclosing the issue publicly.

## Scope

In scope: the `radix-native` package published to npm (`packages/radix-native`) and this repository's build and release pipeline.

Out of scope: the example app in `apps/example`, and vulnerabilities in third-party dependencies — please report those to the upstream project. If an upstream issue has a specific impact on Radix Native, a report here is welcome.
