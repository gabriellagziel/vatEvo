"""
Base adapter interface for compliance gateways
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from enum import Enum

class AdapterStatus(Enum):
    """Adapter implementation status"""
    IMPLEMENTED = "implemented"
    IN_DEVELOPMENT = "in_development"
    PLANNED = "planned"
    DEPRECATED = "deprecated"

class AdapterResult:
    """Result from adapter operations"""
    def __init__(self, success: bool, data: Optional[Dict[str, Any]] = None, error: Optional[str] = None):
        self.success = success
        self.data = data or {}
        self.error = error

class BaseAdapter(ABC):
    """Base class for all compliance adapters"""
    
    def __init__(self, country_code: str, gateway_name: str, status: AdapterStatus):
        self.country_code = country_code
        self.gateway_name = gateway_name
        self.status = status
    
    @abstractmethod
    def validate_invoice(self, invoice_data: Dict[str, Any]) -> AdapterResult:
        """Validate invoice data against country-specific rules"""
        pass
    
    @abstractmethod
    def generate_xml(self, invoice_data: Dict[str, Any]) -> AdapterResult:
        """Generate country-specific XML format"""
        pass
    
    @abstractmethod
    def submit_invoice(self, xml_data: str, metadata: Dict[str, Any]) -> AdapterResult:
        """Submit invoice to compliance gateway"""
        pass
    
    @abstractmethod
    def get_submission_status(self, submission_id: str) -> AdapterResult:
        """Get status of submitted invoice"""
        pass
    
    @abstractmethod
    def get_error_codes(self) -> Dict[str, str]:
        """Get country-specific error codes and descriptions"""
        pass
    
    def is_implemented(self) -> bool:
        """Check if adapter is fully implemented"""
        return self.status == AdapterStatus.IMPLEMENTED
    
    def get_status(self) -> str:
        """Get adapter status"""
        return self.status.value
