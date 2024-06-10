# Features

1. Typed Fauna Syntax

- Collection
  - Static Methods
    - all() ❌
    - byName() ❌
    - create() ❌
    - firstWhere() ❌
    - toString() ❌
    - where() ❌
  - Instance Methods
    - all() ✅
    - byId() ✅
    - create() ✅
    - createData() ❌
    - delete() ✅
    - exists() ❌
    - firstWhere() ❌
    - replace() ✅
    - update() ✅
    - where() ✅
    - \<indexName>() ❌
- Credential ❌
- Database ❌
- Date ❌
- Document
  - delete() ✅
  - exists() ❌
  - replace() ✅
  - replaceData() ❌
  - update() ✅
  - updateData() ❌
- Function ❌
- Key ❌
- Math ❌
- Object ❌
- Role ❌
- Set ❌
- String ❌
- Time ❌
- Token ❌
- TransactionTime ❌
- Global functions ❌

2. Lazy Store (Get the results from the store synchronous and the client fetches asynchronous the up to date data from the database and updates the store. (Same with create, update, and delete))
3. Undo & Redo (Full-Store -> Bad performance)

TODO:

- Connected stores (e.g. User with Account)
- Auto-Generated Types
- Database Integration
- Streaming
- Auto-Generate Run-time validator
- Undo & Redo (Storing only the diff between changes)
- Cross-Store Undo & Redo
