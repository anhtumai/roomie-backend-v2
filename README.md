# Backend for Roomie App

> An app helps roommates in one apartment manage housework

## Documentation

This backend repo contains 2 services:

`graphql-api`: A GraphQL server providing APIs for mobile application to read
and write to an underlying MongoDB database. All APIs are secured and
authenticated with Firebase Auth. Detailed documentation: (./graphql-api/README.md)

`post-signup-firebase-function`: a post signup Google Cloud Function hook for
Firebase Auth. After signing up new user, it will create new user record in
managed MongoDB database, with primary key is `sub` from Firebase Auth.
Detailed documentation: (./post-signup-firebase-function/README.md)
