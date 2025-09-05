from typing import Dict, Any
from decimal import Decimal
from datetime import datetime
from .schemas import InvoiceValidateRequest, ValidationResult
from .models import Invoice


def validate_invoice_data(data: InvoiceValidateRequest) -> ValidationResult:
    """Validate invoice data against business rules"""
    errors = []
    warnings = []
    
    if not data.supplier.vat_id:
        errors.append("Supplier VAT ID is required")
    
    if data.country_code.value in ["IT", "DE"] and not data.customer.vat_id:
        errors.append(f"Customer VAT ID is required for {data.country_code.value}")
    
    if not data.line_items:
        errors.append("At least one line item is required")
    
    for i, item in enumerate(data.line_items):
        if Decimal(item.unit_price) <= 0:
            errors.append(f"Line item {i+1}: Unit price must be positive")
        
        if item.quantity <= 0:
            errors.append(f"Line item {i+1}: Quantity must be positive")
        
        expected_tax = Decimal(item.unit_price) * Decimal(str(item.quantity)) * Decimal(str(item.tax_rate)) / 100
        if abs(expected_tax - Decimal(item.tax_amount)) > Decimal("0.01"):
            warnings.append(f"Line item {i+1}: Tax amount calculation may be incorrect")
    
    return ValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings
    )


def generate_ubl_xml(invoice: Invoice) -> str:
    """Generate UBL 2.1 compliant XML for the invoice"""
    
    ubl_template = f"""<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    
    <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
    <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
    <cbc:ID>{invoice.invoice_number}</cbc:ID>
    <cbc:IssueDate>{invoice.issue_date.strftime('%Y-%m-%d')}</cbc:IssueDate>
    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>{invoice.currency}</cbc:DocumentCurrencyCode>
    
    <!-- Supplier Party -->
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>{invoice.supplier_data['name']}</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>{invoice.supplier_data['address']}</cbc:StreetName>
                <cbc:CityName>{invoice.supplier_data['city']}</cbc:CityName>
                <cbc:PostalZone>{invoice.supplier_data['postal_code']}</cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>{invoice.supplier_data['country']}</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>{invoice.supplier_data['vat_id']}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
        </cac:Party>
    </cac:AccountingSupplierParty>
    
    <!-- Customer Party -->
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>{invoice.customer_data['name']}</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>{invoice.customer_data['address']}</cbc:StreetName>
                <cbc:CityName>{invoice.customer_data['city']}</cbc:CityName>
                <cbc:PostalZone>{invoice.customer_data['postal_code']}</cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>{invoice.customer_data['country']}</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>"""
    
    if invoice.customer_data.get('vat_id'):
        ubl_template += f"""
            <cac:PartyTaxScheme>
                <cbc:CompanyID>{invoice.customer_data['vat_id']}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>"""
    
    ubl_template += """
        </cac:Party>
    </cac:AccountingCustomerParty>
    
    <!-- Invoice Lines -->"""
    
    for i, item in enumerate(invoice.line_items, 1):
        ubl_template += f"""
    <cac:InvoiceLine>
        <cbc:ID>{i}</cbc:ID>
        <cbc:InvoicedQuantity unitCode="C62">{item['quantity']}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="{invoice.currency}">{item['line_total']}</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Description>{item['description']}</cbc:Description>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="{invoice.currency}">{item['unit_price']}</cbc:PriceAmount>
        </cac:Price>
        <cac:TaxTotal>
            <cbc:TaxAmount currencyID="{invoice.currency}">{item['tax_amount']}</cbc:TaxAmount>
            <cac:TaxSubtotal>
                <cbc:TaxableAmount currencyID="{invoice.currency}">{item['line_total']}</cbc:TaxableAmount>
                <cbc:TaxAmount currencyID="{invoice.currency}">{item['tax_amount']}</cbc:TaxAmount>
                <cac:TaxCategory>
                    <cbc:ID>S</cbc:ID>
                    <cbc:Percent>{item['tax_rate']}</cbc:Percent>
                    <cac:TaxScheme>
                        <cbc:ID>VAT</cbc:ID>
                    </cac:TaxScheme>
                </cac:TaxCategory>
            </cac:TaxSubtotal>
        </cac:TaxTotal>
    </cac:InvoiceLine>"""
    
    ubl_template += f"""
    
    <!-- Tax Total -->
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="{invoice.currency}">{invoice.tax_amount}</cbc:TaxAmount>
    </cac:TaxTotal>
    
    <!-- Legal Monetary Total -->
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="{invoice.currency}">{invoice.subtotal}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="{invoice.currency}">{invoice.subtotal}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="{invoice.currency}">{invoice.total_amount}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="{invoice.currency}">{invoice.total_amount}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
    
</Invoice>"""
    
    return ubl_template


def generate_country_specific_xml(invoice: Invoice) -> str:
    """Generate country-specific XML format (FatturaPA, XRechnung, etc.)"""
    
    if invoice.country_code.value == "IT":
        return generate_fatturapa_xml(invoice)
    elif invoice.country_code.value == "DE":
        return generate_xrechnung_xml(invoice)
    elif invoice.country_code.value == "FR":
        return generate_facturx_xml(invoice)
    else:
        return generate_ubl_xml(invoice)


def generate_fatturapa_xml(invoice: Invoice) -> str:
    """Generate FatturaPA XML for Italy"""
    fatturapa_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica xmlns:ds="http://www.w3.org/2000/09/xmldsig#" 
                      xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" 
                      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                      versione="FPR12">
    <FatturaElettronicaHeader>
        <DatiTrasmissione>
            <IdTrasmittente>
                <IdCodice>{invoice.supplier_data['vat_id']}</IdCodice>
                <IdPaese>IT</IdPaese>
            </IdTrasmittente>
            <ProgressivoInvio>1</ProgressivoInvio>
            <FormatoTrasmissione>FPR12</FormatoTrasmissione>
            <CodiceDestinatario>0000000</CodiceDestinatario>
        </DatiTrasmissione>
        <CedentePrestatore>
            <DatiAnagrafici>
                <IdFiscaleIVA>
                    <IdPaese>IT</IdPaese>
                    <IdCodice>{invoice.supplier_data['vat_id']}</IdCodice>
                </IdFiscaleIVA>
                <Anagrafica>
                    <Denominazione>{invoice.supplier_data['name']}</Denominazione>
                </Anagrafica>
            </DatiAnagrafici>
            <Sede>
                <Indirizzo>{invoice.supplier_data['address']}</Indirizzo>
                <CAP>{invoice.supplier_data['postal_code']}</CAP>
                <Comune>{invoice.supplier_data['city']}</Comune>
                <Nazione>IT</Nazione>
            </Sede>
        </CedentePrestatore>
        <CessionarioCommittente>
            <DatiAnagrafici>
                <IdFiscaleIVA>
                    <IdPaese>{invoice.customer_data['country']}</IdPaese>
                    <IdCodice>{invoice.customer_data.get('vat_id', 'N/A')}</IdCodice>
                </IdFiscaleIVA>
                <Anagrafica>
                    <Denominazione>{invoice.customer_data['name']}</Denominazione>
                </Anagrafica>
            </DatiAnagrafici>
            <Sede>
                <Indirizzo>{invoice.customer_data['address']}</Indirizzo>
                <CAP>{invoice.customer_data['postal_code']}</CAP>
                <Comune>{invoice.customer_data['city']}</Comune>
                <Nazione>{invoice.customer_data['country']}</Nazione>
            </Sede>
        </CessionarioCommittente>
    </FatturaElettronicaHeader>
    <FatturaElettronicaBody>
        <DatiGenerali>
            <DatiGeneraliDocumento>
                <TipoDocumento>TD01</TipoDocumento>
                <Divisa>{invoice.currency}</Divisa>
                <Data>{invoice.issue_date.strftime('%Y-%m-%d')}</Data>
                <Numero>{invoice.invoice_number}</Numero>
                <ImportoTotaleDocumento>{invoice.total_amount}</ImportoTotaleDocumento>
            </DatiGeneraliDocumento>
        </DatiGenerali>
        <DatiBeniServizi>"""
    
    for i, item in enumerate(invoice.line_items, 1):
        fatturapa_xml += f"""
            <DettaglioLinee>
                <NumeroLinea>{i}</NumeroLinea>
                <Descrizione>{item['description']}</Descrizione>
                <Quantita>{item['quantity']}</Quantita>
                <PrezzoUnitario>{item['unit_price']}</PrezzoUnitario>
                <PrezzoTotale>{item['line_total']}</PrezzoTotale>
                <AliquotaIVA>{item['tax_rate']}</AliquotaIVA>
            </DettaglioLinee>"""
    
    fatturapa_xml += """
        </DatiBeniServizi>
    </FatturaElettronicaBody>
</p:FatturaElettronica>"""
    
    return fatturapa_xml


def generate_xrechnung_xml(invoice: Invoice) -> str:
    """Generate XRechnung XML for Germany (based on UBL)"""
    ubl_xml = generate_ubl_xml(invoice)
    return ubl_xml.replace(
        "urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0",
        "urn:cen.eu:en16931:2017#compliant#urn:xoev-de:kosit:standard:xrechnung_2.0"
    )


def generate_facturx_xml(invoice: Invoice) -> str:
    """Generate Factur-X XML for France"""
    return generate_ubl_xml(invoice)
