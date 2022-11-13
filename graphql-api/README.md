# GraphQL server for Roomie app

## Documentation

Architecture diagram:

ERD diagram for MongoDB:

## Instruction

### Installation

```bash
yarn
```

### Run on localhost

Requirements:

- `yarn` package manager
- `NodeJs` runtime

0. (Optional) Set up MongoDB and Firebase Auth

1. Create a dot file `.env` in `grapql-api` folder with below content:

```.env
MONGODB_URI=""
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""
```

2. Run this command in `graphql-api` folder:

```bash
yarn run local
```
