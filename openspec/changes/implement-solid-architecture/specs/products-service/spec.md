## MODIFIED Requirements

### Requirement: Products service relies on repositories and domain helpers

`products-service` SHALL orchestrate product and variant creation via `ProductRepository` and `VariantRepository`, enrich metadata through dedicated helpers, and expose read helpers for the dashboard without embedding SQL or inventory logic.

#### Scenario: Creating product with variants uses repositories

- **WHEN** a store owner creates a product with multiple variants
- **THEN** `products-service.createProductWithVariants` calls `productRepository.insert` and `variantRepository.bulkInsert` with validated payloads, ensuring the service delegates persistence and stays testable

#### Scenario: Listing products uses repository read helpers

- **WHEN** the dashboard lists products for a store
- **THEN** `products-service.listForStore` calls `productRepository.listForStore` and returns the same DTO shape without constructing raw SQL queries or mixing in inventory calculations
