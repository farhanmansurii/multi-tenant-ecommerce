# Storefront Login Flow

```mermaid
flowchart TD
    A[Customer visits /stores/{slug}/login] --> B{Signed-in session?}
    B -- No --> C[Render Google-only login CTA]
    C --> D[Customer clicks Continue with Google]
    D --> E[Better Auth /social redirect]
    E --> F[Google OAuth consent]
    F --> G[Auth callback receives user + slug]
    G --> H[Lookup store by slug]
    H --> I[Upsert store_customers row with role=storefront_customer]
    I --> J[Attach storeId & role claims to session]
    J --> K[Redirect to /stores/{slug}/account]
    K --> L[Account page hydrates customer slice]
    L --> M{Session user is store owner?}
    M -- Yes --> N[Show owner-only message, no customer data]
    M -- No --> O[Expose wishlist, addresses, orders for tenant]

    B -- Yes --> P{Session role?}
    P -- storefront_customer and same slug --> K
    P -- store owner --> N
    P -- other --> Q[Prompt to sign out or continue as guest]
```

## Role Persistence

- The new `store_customers` table keeps a row per (`storeId`, `userId`) with the assigned `role` and optional customer data snapshots (wishlist, addresses, orders).
- During social login, the auth callback uses the slug to upsert the row and populates session claims so client code can distinguish storefront customers from store owners/admins.
- Storefront UI components read the session role to toggle customer-only features (wishlist, checkout, etc.) without colliding with dashboard owners.
```
