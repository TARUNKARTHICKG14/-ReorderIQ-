import pytest
from app.simulation.probabilistic_policy import ProbabilisticPolicy
from app.simulation.baseline import BaselinePolicy
from app.simulation.monte_carlo import MonteCarloSimulator

def test_pack_size_rounding():
    # Test integer ceiling rounding to pack size 100
    assert ProbabilisticPolicy.round_to_pack_size(230, 100) == 300
    assert ProbabilisticPolicy.round_to_pack_size(100, 100) == 100
    assert ProbabilisticPolicy.round_to_pack_size(10, 100) == 100
    assert ProbabilisticPolicy.round_to_pack_size(501, 250) == 750

    # Test invalid pack size raises ValueError
    with pytest.raises(ValueError):
        ProbabilisticPolicy.round_to_pack_size(200, 0)
    
    with pytest.raises(ValueError):
        ProbabilisticPolicy.round_to_pack_size(200, -50)

def test_probabilistic_vs_baseline_rop():
    # High lead time standard deviation + low supplier reliability should increase probabilistic safety stock ROP
    demand_mean = 100.0
    avg_lt = 7.0
    
    base_res = BaselinePolicy.calculate_policy(demand_mean=demand_mean, avg_lead_time=avg_lt, pack_size=100)
    assert base_res["reorder_point"] == 700 # 100 * 7

    prob_res = ProbabilisticPolicy.calculate_policy(
        demand_mean=100.0,
        demand_std=30.0,
        avg_lead_time=7.0,
        lead_time_std=3.0,
        reliability=0.75, # Unreliable supplier
        fill_rate=0.90,
        pack_size=100,
        unit_cost=50.0,
        holding_cost=10.0,
        order_cost=150.0,
        service_target=0.95
    )

    # Probabilistic ROP should be strictly higher than baseline 700 to protect against lead time variability
    assert prob_res["reorder_point"] > base_res["reorder_point"]
    assert prob_res["recommended_order_quantity"] % 100 == 0 # Must respect pack size

def test_monte_carlo_trajectory():
    simulator = MonteCarloSimulator(
        demand_mean=100.0,
        demand_std=20.0,
        avg_lead_time=7.0,
        lead_time_std=1.5,
        reliability=0.95,
        fill_rate=0.98,
        pack_size=100,
        unit_cost=50.0,
        holding_cost=10.0,
        stockout_cost=125.0,
        order_cost=150.0,
        initial_inventory=500
    )

    comp_res = simulator.run_comparison(
        baseline_rop=700,
        baseline_order_qty=300,
        prob_rop=850,
        prob_order_qty=400,
        days=100,
        seed=42
    )

    assert "baseline_metrics" in comp_res
    assert "probabilistic_metrics" in comp_res
    assert comp_res["probabilistic_metrics"]["service_level"] >= comp_res["baseline_metrics"]["service_level"]
