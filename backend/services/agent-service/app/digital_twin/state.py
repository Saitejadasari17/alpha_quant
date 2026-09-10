from dataclasses import dataclass, field
from typing import Dict, List, Any
import copy


@dataclass
class FinancialState:
    income: float = 0.0
    expenses: float = 0.0
    assets: float = 0.0
    liabilities: float = 0.0
    savings: float = 0.0
    investments: float = 0.0
    existing_emi: float = 0.0
    goals: List[Dict[str, Any]] = field(default_factory=list)

    def clone(self) -> "FinancialState":
        return copy.deepcopy(self)
