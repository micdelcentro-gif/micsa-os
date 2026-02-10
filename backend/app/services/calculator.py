# MICSA OS - Quotation Calculator Service
import math
from typing import Dict, List, Any

def r2(n: float) -> float:
    return round(n, 2)

class QuotationCalculator:
    def __init__(self, rules: Dict[str, Any], catalog_epp: Dict[str, Any]):
        self.rules = rules
        self.catalog_epp = catalog_epp

    def estimate_epp(self, people: int, months: float) -> Dict[str, Any]:
        qty = {}
        def add(sku, q):
            qty[sku] = qty.get(sku, 0) + q

        add("CASCO_MATRACA", 1 * people)
        add("CHALECO_REF", 1 * people)
        add("BARBIQUEJO_2P", 1 * people)
        add("CALZADO_SEG", 1 * people)
        add("LENTE_BASICO", 4 * people * months)
        add("GUANTE_NITRILO", 4 * people * months)
        
        working_days = self.rules.get("epp", {}).get("workingDaysMonth", 26)
        add("TAPON_DESECHABLE", 1 * people * (working_days * months))

        cost_real_plus_iva = 0.0
        lines = []
        for sku, q in qty.items():
            item = self.catalog_epp.get(sku)
            unit_price = item.pricePlusIva if item else 0.0
            line_cost = unit_price * q
            cost_real_plus_iva += line_cost
            lines.append({
                "sku": sku,
                "name": item.name if item else "SKU_NO_ENCONTRADO",
                "unit": item.unit if item else "pz",
                "qty": q,
                "unitPricePlusIva": r2(unit_price),
                "lineCostPlusIva": r2(line_cost)
            })

        markup = self.rules.get("epp", {}).get("markupPct", 0.25)
        sell = cost_real_plus_iva * (1 + markup)
        
        return {
            "lines": lines,
            "totals": {
                "costRealPlusIva": r2(cost_real_plus_iva),
                "sellPriceToMicsaPlusIva": r2(sell),
                "profitPlusIva": r2(sell - cost_real_plus_iva),
                "markupPct": markup
            }
        }

    def price_commercialization(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        cost_real = 0.0
        price = 0.0
        lines = []
        default_margin = self.rules.get("commercialization", {}).get("defaultMarginPct", 0.20)
        
        for it in items:
            m = it.get("marginPct", default_margin)
            qty = it.get("qty", 0)
            vendor_cost = it.get("vendorCost", 0)
            line_cost = vendor_cost * qty
            line_price = line_cost * (1 + m)
            cost_real += line_cost
            price += line_price
            
            lines.append({
                **it,
                "marginPct": m,
                "lineCost": r2(line_cost),
                "linePrice": r2(line_price),
                "lineProfit": r2(line_price - line_cost)
            })
            
        return {
            "costReal": r2(cost_real),
            "price": r2(price),
            "profit": r2(price - cost_real),
            "lines": lines
        }

    def compute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        iva_pct = 0.16 # Default or from config
        
        people = sum(int(v) for v in input_data.get("peopleByRole", {}).values())
        months = float(input_data.get("durationMonths", 1))

        labor_rules = self.rules.get("labor", {"weekly": 6489.25, "weeksMonth": 4})
        labor_monthly = labor_rules["weekly"] * labor_rules["weeksMonth"]
        labor_cost = labor_monthly * months * people

        welders_count = int(input_data.get("weldersCount", 0))
        welding_rules = self.rules.get("welding", {"per10Month": {"cost": 18446.96, "price": 21213}})
        welding_units = math.ceil(welders_count / 10) if welders_count > 0 else 0
        welding_real = welding_units * welding_rules["per10Month"]["cost"] * months
        welding_billed = welding_units * welding_rules["per10Month"]["price"] * months
        
        consumables_rate = self.rules.get("weldingConsumablesPerWelderMonth", 3800)
        welding_consumables = welders_count * consumables_rate * months

        dc3_rules = self.rules.get("dc3", {"sell": 500, "package": 1500, "cost": 100})
        dc3_people = int(input_data.get("dc3PeopleCount", 0))
        dc3_packages = int(input_data.get("dc3PackageCount", 0))
        dc3_cost = (dc3_people * dc3_rules["cost"]) + (dc3_packages * dc3_rules["cost"] * 3)
        dc3_sell = (dc3_people * dc3_rules["sell"]) + (dc3_packages * dc3_rules["package"])

        med_rules = self.rules.get("medical", {"cost": 250, "sell": 350})
        medical_enabled = input_data.get("medical", {}).get("enabled", True)
        medical_cost = (people * med_rules["cost"]) if medical_enabled else 0
        medical_sell = (people * med_rules["sell"]) if medical_enabled else 0

        epp_enabled = input_data.get("epp", {}).get("enabled", True)
        epp = self.estimate_epp(people, months) if epp_enabled else None
        epp_cost = epp["totals"]["costRealPlusIva"] if epp_enabled else 0
        epp_sell = epp["totals"]["sellPriceToMicsaPlusIva"] if epp_enabled else 0

        comm_data = input_data.get("commercialization", {"enabled": False, "items": []})
        comm = self.price_commercialization(comm_data.get("items", [])) if comm_data.get("enabled") else {"costReal": 0, "price": 0, "profit": 0, "lines": []}

        pm_fee_rate = self.rules.get("platformPM", {}).get("feePerPersonMonth", 180)
        pm_enabled = input_data.get("platformPM", {}).get("enabled", True)
        pm_fee = (pm_fee_rate * people * months) if pm_enabled else 0

        iso_fee_rate = self.rules.get("iso", {}).get("feePerProjectMonth", 3500)
        iso_enabled = input_data.get("iso", {}).get("enabled", True)
        iso_fee = (iso_fee_rate * months) if iso_enabled else 0

        logistics = input_data.get("logistics", {"enabled": False})
        logistics_cost = 0.0
        if logistics.get("enabled"):
            rooms = math.ceil(logistics.get("travelPeopleCount", 0) / logistics.get("peoplePerRoom", 2))
            hotel = rooms * logistics.get("hotelPerNight", 1200) * logistics.get("hotelNights", 0)
            per_diem = logistics.get("travelPeopleCount", 0) * logistics.get("perDiemPerDay", 350) * logistics.get("perDiemDays", 0)
            travel = logistics.get("travelPeopleCount", 0) * logistics.get("roundTripTravelPerPerson", 6342)
            logistics_cost = hotel + per_diem + travel

        direct_real = labor_cost + welding_real + welding_consumables + dc3_cost + medical_cost + epp_cost + comm["costReal"] + pm_fee + iso_fee + logistics_cost
        direct_pricing_base = labor_cost + welding_billed + welding_consumables + dc3_sell + medical_sell + epp_sell + comm["price"] + pm_fee + iso_fee + logistics_cost

        mgmt_pct = self.rules.get("managementPct", 0.15)
        management_fee = direct_pricing_base * mgmt_pct

        subtotal = direct_pricing_base + management_fee
        iva = subtotal * iva_pct
        total = subtotal + iva

        client_quote = {
            "header": {
                "company": "GRUPO MICSA",
                "clientName": input_data.get("clientName"),
                "projectName": input_data.get("projectName"),
                "location": input_data.get("location"),
                "workType": input_data.get("workType"),
                "durationMonths": months,
                "paymentTerms": input_data.get("paymentTerms", "NETO 30")
            },
            "commercial": {
                "subtotal": r2(subtotal),
                "iva": r2(iva),
                "total": r2(total),
                "currency": "MXN",
                "validity": "15 días",
                "notes": [
                    "Tiempo extra no incluido. Se cotiza por separado conforme a ley.",
                    "Gestión MICSA obligatoria (15%)."
                ]
            }
        }

        gross_profit = (direct_pricing_base + management_fee) - direct_real
        margin_pct = (gross_profit / subtotal) * 100 if subtotal > 0 else 0

        internal = {
            "totals": {
                "people": people,
                "directRealCost": r2(direct_real),
                "pricingBase": r2(direct_pricing_base),
                "managementFee15": r2(management_fee),
                "grossProfitBeforeIva": r2(gross_profit),
                "marginPct": r2(margin_pct)
            },
            "divisions": {
                "labor": {"cost": r2(labor_cost)},
                "welding": {
                    "units": welding_units,
                    "costReal": r2(welding_real),
                    "billed": r2(welding_billed),
                    "profit": r2(welding_billed - welding_real),
                    "consumables": r2(welding_consumables)
                },
                "dc3": {"cost": r2(dc3_cost), "sell": r2(dc3_sell), "profit": r2(dc3_sell - dc3_cost)},
                "medical": {"cost": r2(medical_cost), "sell": r2(medical_sell), "profit": r2(medical_sell - medical_cost)},
                "epp": epp["totals"] if epp else {"costRealPlusIva": 0, "sellPriceToMicsaPlusIva": 0, "profitPlusIva": 0, "markupPct": 0.25},
                "commercialization": {"cost": comm["costReal"], "sell": comm["price"], "profit": comm["profit"]},
                "platformPM": {"sell": r2(pm_fee)},
                "iso": {"sell": r2(iso_fee)},
                "logistics": {"cost": r2(logistics_cost)}
            },
            "eppLines": epp["lines"] if epp else [],
            "commLines": comm["lines"],
            "riskFlags": [
                "⚠️ Riesgo financiero por cobranza (NETO 30)" if "NETO 30" in input_data.get("paymentTerms", "").upper() else None,
                "⚠️ Proyecto grande (>50 personas)" if people > 50 else None
            ]
        }
        internal["riskFlags"] = [f for f in internal["riskFlags"] if f]

        return {
            "clientQuote": client_quote,
            "internal": internal,
            "totals": {"subtotal": r2(subtotal), "iva": r2(iva), "total": r2(total)}
        }
