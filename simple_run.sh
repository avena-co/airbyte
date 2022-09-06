#!/bin/bash

export VERSION=0.40.0-alpha

./gradlew :airbyte-webapp:assemble && ./gradlew :airbyte-server:assemble && docker-compose up

# Source: (API, Database, Google Sheet)

# Normalization can either be "consolidate" or "expand"

# Normalize: (Names, URL, Address, Phone)
# Deduplicate
# Enrich Data (Geocode, NLP keyword extract)

# Destination: (API, Database, Tableau)

# TODO:
# - Server/API/Workers etc
# -- Fix openapi definitions
# -- Implement everything
# - Pipelines menu
# -- Implement frontend after backend is done
# -- Pipeline editor
# -- Modify the APIs to hold pipeline editor data
# - Pipeline selection:
# -- Dropdown needs to be populated with list of pipelines
# -- Need to be able to save selected dropdown value in connection somehow
# -- Build new pipeline should take user to pipelines page with connection selected
# - Transformations
# -- Hook pipelines to syncs
