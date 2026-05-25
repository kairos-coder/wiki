---
title: Artemis
description: Goddess of the Hunt — Card-based chat inference engine v3.0
namespace: pantheon
scribe: Copyist
feast: the Day of the Silver Bow
source: kairos-coder/artemis
---

# ARTEMIS

*Goddess of the Hunt · EaldfornAI · v3.0 Huntress Engine*

## Domain

Artemis is the **Huntress Engine**. She does not generate text. She hunts data through nine cards, classifies input via heuristic pattern matching, retrieves from GaiaDB, free APIs (Wikipedia, OpenLibrary, Dictionary, Quotable), and repository files, correlates results, and assembles responses from what she finds.

## Cards

| Card | Category | Function |
|------|----------|----------|
| gaia_recall | memory | Hunts GaiaDB for past conversations |
| memory_manager | meta | LocalDB cache, memory graph, session state |
| api_hunt | retrieval | Hunts free APIs — Wikipedia, OpenLibrary, Dictionary, Quotable |
| browser_hunt | retrieval | Hunts repository files |
| card_voter | correlation | Correlates card outputs, updates learned weights |
| compress | memory | Pattern extraction, Ealdforn compression token |
| status_report | response | Reports Artemis current state |
| greeting | response | Conversational framing — terse, huntress voice |
| decision_log | system | Logs every decision for weight learning |

## Architecture

No Pollinations. No text generation APIs. Pure chat inference loop:

1. classifyInput() — heuristic pattern matching
2. selectCards() — top N above confidence threshold
3. executeCards() — each card hunts its data source
4. correlationEngine — finds overlaps between hunt results
5. responseBuilder — assembles response from retrieved data

## Session

Session ID prefix: `art_` · Weights stored in localStorage · GaiaDB for persistent memory

---

*Transcribed by the Copyist on the Day of the Silver Bow.*
