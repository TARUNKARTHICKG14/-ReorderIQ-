class PolicyMetrics:
    """
    Computes comprehensive operational, financial, and environmental metrics.
    """
    @staticmethod
    def calculate_summary(
        inventory_history,
        demand_history,
        order_events,
        unit_cost,
        holding_cost,
        stockout_cost,
        order_cost,
        distance_km=350.0,
        emission_factor=0.00015,
        unit_weight_kg=1.0
    ):
        n_days = len(inventory_history)
        if n_days == 0:
            return {}

        total_demanded = sum(demand_history)
        total_unmet = 0
        stockout_days = 0
        excess_units_accum = 0

        for inv, dem in zip(inventory_history, demand_history):
            if inv <= 0:
                stockout_days += 1
                unmet = min(dem, abs(inv) + dem)
                total_unmet += unmet
            
            # Excess inventory defined as inventory exceeding 3x safety buffer
            if inv > 1000:
                excess_units_accum += (inv - 1000)

        # Service level metrics
        service_level = float((n_days - stockout_days) / n_days)
        fill_rate = float((total_demanded - total_unmet) / total_demanded) if total_demanded > 0 else 1.0

        avg_inventory = float(sum(max(0, inv) for inv in inventory_history) / n_days)
        avg_excess_inventory = float(excess_units_accum / n_days)

        # Financial costs
        # Daily holding cost per unit = annual holding cost / 365
        daily_holding_rate = holding_cost / 365.0
        total_holding_cost = float(sum(max(0, inv) * daily_holding_rate for inv in inventory_history))

        # Stockout penalty cost
        total_stockout_cost = float(total_unmet * stockout_cost)

        # Order placement costs & Emergency order penalties
        num_orders = len(order_events)
        total_order_cost = float(num_orders * order_cost)
        
        emergency_orders = sum(1 for o in order_events if o.get("is_emergency", False))
        emergency_freight_penalty = float(emergency_orders * (order_cost * 3.0))

        total_cost = total_holding_cost + total_stockout_cost + total_order_cost + emergency_freight_penalty

        # Environmental emissions
        # Standard shipment carbon emissions = Distance (km) * Total Units * Unit Weight (kg) * Emission Factor
        total_units_shipped = sum(o.get("quantity", 0) for o in order_events)
        base_emissions_kg = total_units_shipped * unit_weight_kg * distance_km * emission_factor
        
        # Emergency air shipments emit ~4x carbon per kg-km
        emergency_units_shipped = sum(o.get("quantity", 0) for o in order_events if o.get("is_emergency", False))
        emergency_emissions_kg = emergency_units_shipped * unit_weight_kg * distance_km * (emission_factor * 3.5)

        total_emissions_kg = float(base_emissions_kg + emergency_emissions_kg)

        return {
            "service_level": round(service_level, 4),
            "fill_rate": round(fill_rate, 4),
            "stockout_count": stockout_days,
            "total_unmet_units": round(total_unmet, 1),
            "avg_inventory": round(avg_inventory, 1),
            "excess_inventory": round(avg_excess_inventory, 1),
            "holding_cost": round(total_holding_cost, 2),
            "stockout_cost": round(total_stockout_cost, 2),
            "order_cost": round(total_order_cost, 2),
            "emergency_cost": round(emergency_freight_penalty, 2),
            "total_cost": round(total_cost, 2),
            "emissions_kg": round(total_emissions_kg, 2)
        }
