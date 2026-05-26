# SetShip Agent Static Dataset

Synthetic, Wayfair-shaped dataset for a 60-minute hackathon MVP. No real Wayfair operational data is included.

## Demo goal
Build an agent that evaluates incomplete furniture-set fulfillment and recommends one of:

- `hold`
- `split_ship`
- `reroute`
- `supplier_direct`
- `escalate`

The best demo path is `ORD-1042`, where a dining set is blocked by one missing hardware kit at the preferred CastleGate node. The agent should recommend rerouting the kit from another CastleGate node instead of split-shipping or trusting a stale supplier feed.

## Files

| File | Purpose |
|---|---|
| `nodes.csv` | Warehouses, suppliers, and customer zones |
| `sets.csv` | Sellable furniture sets |
| `components.csv` | Component-level product metadata |
| `bom.csv` | Bill of materials for each furniture set |
| `orders.csv` | Customer orders needing fulfillment decisions |
| `inventory.csv` | Component inventory by node, with reserved quantities and feed age |
| `lanes.csv` | Transit days, costs, and handling risk between nodes |
| `supplier_scores.csv` | Supplier reliability fields for scoring risk |
| `inbound_pos.csv` | Incoming purchase/order lines that may unblock orders |
| `open_shipments.csv` | Already-started partial shipments for exception reconciliation |
| `policy_weights.json` | Simple scoring weights for the decision engine |
| `expected_recommendations.csv` | Demo-case answer key for smoke testing |

## Recommended evaluation logic

1. Read `orders.csv`.
2. Join `orders.set_sku` to `bom.csv`.
3. For each required component, compute available quantity at each node:

```text
available = on_hand - reserved
```

4. Identify missing or bottleneck components at the preferred fulfillment node.
5. Evaluate each action:

```text
score = 100
      - delay_days * delay_penalty
      - extra_cost * cost_penalty
      - split_ship_flag * split_penalty
      - stale_supplier_flag * stale_feed_penalty
      - damage_risk * damage_penalty
      + meets_promise_flag * promise_bonus
      + consolidated_flag * consolidation_bonus
```

6. Return the highest-scoring option and a plain-English explanation.

## Fastest MVP UI

- Order selector
- Component availability table
- Bottleneck/risk flags
- Option comparison table
- Recommendation panel

## Primary demo cases

- `ORD-1042`: recommend `reroute`
- `ORD-1043`: recommend `hold`
- `ORD-1044`: recommend `split_ship`
- `ORD-1045`: recommend `escalate`
