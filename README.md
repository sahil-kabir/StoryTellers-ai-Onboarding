# TO-DO app

```mermaid
flowchart LR
    User[User]

    subgraph Frontend
        RR["React Router App<br/>(UI + Forms)"]
    end

    subgraph Cloudflare
        CFW["Cloudflare Workers<br/>(Loaders/Actions functionality)"]
        BA["BetterAuth"]
    end

    subgraph Database ["Database (Neon)"]
        AuthDB[("Auth DB")]
        TasksDB[("Tasks DB")]
    end

    User -->|HTTP| RR
    RR -->|Requests| CFW

    CFW --> BA
    BA --> AuthDB

    CFW -->|CRUD Tasks| TasksDB
```

### Notes

- The Neon Postgres database is accessed via **HTTP/REST** using Neon’s serverless driver, which is compatible with the Cloudflare Workers runtime (no TCP connections).
- Authentication is handled by **BetterAuth**, with session validation enforced inside React Router **loaders and actions**.
- The application is deployed entirely on **Cloudflare Workers**, avoiding a separate backend service.
