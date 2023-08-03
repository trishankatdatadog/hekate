# Hekate

## Democratizing the monitoring of open-source software supply chains

### Abstract

Various parties within the open-source community such as [GitHub and NPM](https://github.blog/2023-04-19-introducing-npm-package-provenance/) are beginning to produce signed [in-toto](https://in-toto.io/) attestations about how software packages were produced from beginning to end, and record them on tamper-evident logs such as [Sigstore](https://sigstore.dev/), so that we can detect supply chain attacks.

The problem is that:
1. There is no de facto standard (yet) for in-toto verification that tells consumers how to verify attestations, but just as importantly, how to correlate information between them.
2. Even if there was (1), such in-toto verifiers do not (yet) come preinstalled in most environments.
3. There is no such verification-as-a-service as a workaround to (2).
4. There is no network of such independent verifiers-as-a-service.
5. There is no way for observability platforms such as [Datadog](https://www.datadoghq.com/) to query this network and act upon results.

Thus, we present [Hekate](https://github.com/trishankatdatadog/hekate), a set of lightweight serverless functions that independent parties can deploy to perform de jure in-toto verifications-as-a-service. To begin with, we use Hekate to verify whether NPM indeed published a package that was built by a GitHub Actions runner which, in turn, used the expected source code from GitHub. This idea is easily [extensible](https://github.com/ossf/wg-securing-software-repos/blob/main/docs/build-provenance-for-all-package-registries.md) to other package repositories such as PyPI and Homebrew. Hekate is not meant to compete with more general efforts such as GUAC, and is designed to integrate seamlessly with observability platforms that provide valuable features for following up such as alerting and case as well as incident management.

### Description

An in-toto attestation aims to provide you with authenticated metadata about the inputs, outputs, and environment of a step within a supply chain, so that you can compare metadata between different steps in order to detect an attack. For example, you could answer questions such as: did the builder use the same code that a developer committed to the source code repository, and did the package repository publish the same package that the builder produced?

For example, GitHub Actions (GHA) is using the [provenance](https://slsa.dev/provenance/v1) attestation (designed for SLSA v1.0) to cryptographically bind that a GHA Runner was used to build a certain version of an NPM package using a certain GitHub source code repository at a certain branch and commit tree. Furthermore, NPM is using the [publish](https://github.com/npm/attestation/tree/main/specs/publish/v0.1) attestation to state exactly which version of this NPM package it received from a GHA runner.

However, the problem is that producers and consumers do not have tools to easily monitor and correlate data between these attestations so as to answer questions of great interest. For example:
1. Has someone directly uploaded a package to NPM for which there is no corresponding build on GitHub Actions? In other words, is there something on NPM, but not GitHub Actions?
2. Is there a record of a GitHub Actions pipeline run on Sigstore for which there is no corresponding build on GitHub Actions? In other words, is there something on Sigstore, but not GitHub Actions?
3. Is there a mismatch between what was published by GitHub Actions vs NPM? In other words, was there a person-in-the-middle attack?

To solve this problem, we built Hekate, a set of lightweight serverless functions that you can deploy today to answer such questions. Drawing inspiration from the eponymous ancient Greek goddess, known as a guardian and protector who watches over crossroads and entrances, our system acts as a modern-day sentinel overseeing and safeguarding the authenticity, integrity, and consistency of supply chains. We show how you can deploy Hekate on Cloudflare Workers to verify NPM packages with provenance and publish attestations, and act on these verifications using Datadog.
